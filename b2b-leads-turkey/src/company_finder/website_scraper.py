import re
import time
from urllib.parse import urljoin, urlparse

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from src.utils.database import Database
from src.utils.helpers import (
    clean_company_name, extract_domain, extract_emails_from_text,
    extract_phones_from_text, rate_limit_delay, safe_text,
)


class WebsiteScraper:
    """Scrape company websites for contact info, team, about pages"""

    def __init__(self, db: Database):
        self.db = db

    TEAM_PATHS = [
        "/hakkimizda", "/about", "/about-us", "/ekibimiz", "/team",
        "/kurucular", "/founders", "/yönetim", "/management",
        "/biz-kimiz", "/who-we-are", "/hakkimizda/ekibimiz",
        "/calisanlar", "/personel", "/staff",
    ]

    CONTACT_PATHS = [
        "/iletisim", "/contact", "/contact-us", "/bize-ulasin",
        "/iletisim-bilgileri", "/contact-info",
    ]

    ABOUT_PATHS = [
        "/hakkimizda", "/about", "/about-us", "/hakkimizda",
        "/sirket", "/company", "/biz", "/us",
    ]

    def _fetch(self, url, timeout=15):
        from scrapling.fetchers import Fetcher
        return Fetcher.get(url, stealthy_headers=True, timeout=timeout)

    def enrich_company(self, company: dict) -> dict:
        """Scrape company website for additional info"""
        website = company.get("website", "")
        if not website:
            return company

        domain = extract_domain(website)
        if not domain:
            return company

        if not website.startswith("http"):
            website = "https://" + website

        company_id = company.get("id")

        try:
            page = self._fetch(website)
            if page.status != 200:
                return company

            page_text = page.text if page.text else ""

            emails = extract_emails_from_text(page_text)
            if not emails:
                mailtos = page.css('a[href^="mailto:"]')
                for m in mailtos:
                    href = m.attrib.get("href", "")
                    mail_emails = extract_emails_from_text(href)
                    emails.extend(mail_emails)
            if emails:
                company["email"] = emails[0]

            if not company.get("phone"):
                tel_links = page.css('a[href^="tel:"]')
                for t in tel_links:
                    href = t.attrib.get("href", "").replace("tel:", "").strip()
                    if href:
                        company["phone"] = href
                        break

            phones = extract_phones_from_text(page_text)
            if phones and not company.get("phone"):
                company["phone"] = phones[0]

            company["description"] = self._extract_meta_description(page)

            for path in self.TEAM_PATHS:
                team_url = urljoin(website, path)
                try:
                    team_page = self._fetch(team_url, timeout=10)
                    if team_page.status == 200:
                        self._extract_team_members(team_page, company_id)
                        break
                except Exception:
                    continue

            for path in self.CONTACT_PATHS:
                contact_url = urljoin(website, path)
                try:
                    contact_page = self._fetch(contact_url, timeout=10)
                    if contact_page.status == 200:
                        contact_text = contact_page.text if contact_page.text else ""
                        contact_emails = extract_emails_from_text(contact_text)
                        if not contact_emails:
                            mailtos = contact_page.css('a[href^="mailto:"]')
                            for m in mailtos:
                                href = m.attrib.get("href", "")
                                contact_emails.extend(extract_emails_from_text(href))
                        if contact_emails and not company.get("email"):
                            company["email"] = contact_emails[0]
                        contact_phones = extract_phones_from_text(contact_text)
                        if contact_phones and not company.get("phone"):
                            company["phone"] = contact_phones[0]
                        if not company.get("phone"):
                            tel_links = contact_page.css('a[href^="tel:"]')
                            for t in tel_links:
                                href = t.attrib.get("href", "").replace("tel:", "").strip()
                                if href:
                                    company["phone"] = href
                                    break
                        break
                except Exception:
                    continue

            rate_limit_delay(1.5, 3)

        except Exception as e:
            print(f"      [!] Website scrape hatasi ({website}): {e}")

        return company

    def _extract_team_members(self, page, company_id):
        """Extract team members from a team/about page"""
        team_selectors = [
            {"container": ".team-member, .staff, .person, .ekip", "name": "h2, h3, h4, .name, .isim", "title": ".title, .position, .unvan, .gorev"},
            {"container": ".card, .profile, .profil", "name": "h2, h3, h4, .name, .isim", "title": ".title, .position, .unvan"},
            {"container": ".row .col", "name": "h2, h3, h4, strong, b", "title": "p, span, .text"},
        ]

        for selector_set in team_selectors:
            containers = page.css(selector_set["container"])
            if not containers or len(containers) < 2:
                continue

            for container in containers:
                name_els = container.css(selector_set["name"])
                title_els = container.css(selector_set["title"])

                if not name_els:
                    continue

                full_name = safe_text(name_els[0])
                if not full_name or len(full_name) < 3:
                    continue

                name_parts = full_name.split(None, 1)
                first_name = name_parts[0] if len(name_parts) > 0 else ""
                last_name = name_parts[1] if len(name_parts) > 1 else ""

                position = safe_text(title_els[0]) if title_els else ""

                container_text = container(separator=" ") if True else ""
                container_html = str(container) if container else ""
                emails = extract_emails_from_text(container_text)
                phones = extract_phones_from_text(container_text)

                linkedin = ""
                links = container.css("a[href*='linkedin']")
                if links:
                    linkedin = links[0].attrib.get("href", "")

                contact = {
                    "company_id": company_id,
                    "first_name": first_name,
                    "last_name": last_name,
                    "full_name": full_name,
                    "position": position,
                    "email": emails[0] if emails else "",
                    "phone": phones[0] if phones else "",
                    "linkedin": linkedin,
                    "source": "website_team_page",
                }

                if contact["full_name"] and (contact["email"] or contact["position"]):
                    self.db.upsert_contact(contact)

            break

    def _extract_meta_description(self, page):
        """Extract meta description from page"""
        meta = page.css('meta[name="description"]')
        if meta:
            return meta[0].attrib.get("content", "")
        og_desc = page.css('meta[property="og:description"]')
        if og_desc:
            return og_desc[0].attrib.get("content", "")
        return ""

    def batch_enrich(self, limit=50):
        """Enrich multiple companies from database"""
        companies = self.db.get_companies_without_contacts(limit=limit)
        total = 0

        for company in companies:
            print(f"    [>] {company['name']} - {company.get('website', '')}")
            enriched = self.enrich_company(company)
            self.db.upsert_company(enriched)
            total += 1

        self.db.log_scrape("website_enrichment", f"batch_{limit}", total, "success")
        return total
