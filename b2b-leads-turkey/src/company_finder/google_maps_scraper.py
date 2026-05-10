import re
import json
import time
import random
from urllib.parse import quote_plus

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from src.utils.database import Database
from src.utils.helpers import (
    clean_company_name, extract_domain, extract_emails_from_text,
    extract_phones_from_text, rate_limit_delay, normalize_sector,
)

SECTOR_QUERIES = {
    "Teknoloji": [
        "yazılım şirketi Turkey",
        "technology company Turkey",
        "bilgi teknolojileri Turkey",
        "IT company Turkey Istanbul",
        "yazılım firması Ankara",
        "tech startup Turkey",
    ],
    "Finans": [
        "finans şirketi Turkey",
        "fintech Turkey",
        "finance company Turkey Istanbul",
        "yatırım şirketi Turkey",
    ],
    "Savunma Sanayi": [
        "savunma sanayi şirketi Turkey",
        "defense industry company Turkey",
        "askeri teknoloji Turkey",
    ],
    "Otomotiv": [
        "otomotiv şirketi Turkey",
        "automotive company Turkey",
        "otomotiv yan sanayi Turkey",
        "araç üreticisi Turkey",
    ],
    "Inşaat": [
        "inşaat şirketi Turkey",
        "construction company Turkey",
        "yapı firması Turkey Istanbul",
    ],
    "Sağlık": [
        "sağlık şirketi Turkey",
        "healthcare company Turkey",
        "medical company Turkey",
        "tıbbi cihaz Turkey",
    ],
    "Eğitim": [
        "eğitim teknolojisi Turkey",
        "edtech company Turkey",
        "eğitim şirketi Turkey",
    ],
    "Perakende": [
        "perakende şirketi Turkey",
        "retail company Turkey",
        "e-ticaret şirketi Turkey",
    ],
    "Lojistik": [
        "lojistik şirketi Turkey",
        "logistics company Turkey",
        "nakliye firması Turkey",
    ],
    "Enerji": [
        "enerji şirketi Turkey",
        "energy company Turkey",
        "güneş enerjisi Turkey",
        "yenilenebilir enerji Turkey",
    ],
    "Gıda": [
        "gıda şirketi Turkey",
        "food company Turkey",
        "gıda üreticisi Turkey",
    ],
    "Tekstil": [
        "tekstil şirketi Turkey",
        "textile company Turkey",
        "hazır giyim Turkey",
    ],
    "Turizm": [
        "turizm şirketi Turkey",
        "tourism company Turkey",
        "otel Turkey",
        "seyahat şirketi Turkey",
    ],
    "Kimya": [
        "kimya şirketi Turkey",
        "chemical company Turkey",
        "ilaç şirketi Turkey",
    ],
    "Madencilik": [
        "madencilik şirketi Turkey",
        "mining company Turkey",
    ],
}


class GoogleMapsScraper:
    def __init__(self, db: Database):
        self.db = db

    def _fetch(self, url, timeout=20):
        """Make a GET request using Scrapling Fetcher"""
        from scrapling.fetchers import Fetcher
        return Fetcher.get(url, stealthy_headers=True, timeout=timeout)

    def search_sector(self, sector, max_pages=3):
        """Search Google Maps for companies in a sector"""
        queries = SECTOR_QUERIES.get(sector, [f"{sector} şirketi Turkey"])
        total = 0

        for query in queries:
            print(f"    [>] Arama: {query}")
            results = self._search_google_maps(query, max_pages)
            for result in results:
                result["sector"] = sector
                result["source"] = "google_maps"
                self.db.upsert_company(result)
                total += 1
            rate_limit_delay(3, 6)

        self.db.log_scrape("google_maps", sector, total, "success")
        return total

    def _search_google_maps(self, query, max_pages=3):
        """Scrape Google Maps search results"""
        results = []

        encoded_query = quote_plus(query)
        url = f"https://www.google.com/maps/search/{encoded_query}"

        try:
            page = self._fetch(url)
            if page.status != 200:
                print(f"    [!] HTTP {page.status}")
                return results

            listings = page.css('[jsaction*="mouseover"]')
            if not listings:
                listings = page.css('.Nv2PK')
            if not listings:
                listings = page.css('[class*="fontHeadlineSmall"]')

            for listing in listings[:max_pages * 20]:
                company = self._parse_listing(listing)
                if company and company.get("name"):
                    results.append(company)

        except Exception as e:
            print(f"    [!] Hata: {e}")
            self.db.log_scrape("google_maps", query, 0, "error", str(e))

        return results

    def _parse_listing(self, listing):
        """Parse a single Google Maps listing"""
        company = {}

        name_el = listing.css('[class*="fontHeadlineSmall"]')
        if not name_el:
            name_el = listing.css('.qBF1Pd')
        if name_el:
            company["name"] = clean_company_name(name_el[0].text)

        rating_el = listing.css('[role="img"]')
        if rating_el:
            aria_label = rating_el[0].attrib.get("aria-label", "")
            company["description"] = aria_label

        category_el = listing.css(f'[class*="fontBodyMedium"] span:first-child')
        if category_el:
            text = category_el[0].text
            if "·" in text:
                parts = text.split("·")
                company["description"] = parts[0].strip()

        address_el = listing.css('[data-tooltip]')
        if not address_el:
            address_els = listing.css(f'[class*="fontBodyMedium"] span')
            for el in address_els:
                text = el.text
                if any(kw in text.lower() for kw in ["istanbul", "ankara", "izmir", "türkiye", "turkey"]):
                    company["address"] = text
                    break

        phone_el = listing.css('button[data-tooltip*="phone"]')
        if phone_el:
            phone_text = phone_el[0].attrib.get("data-tooltip", "")
            phones = extract_phones_from_text(phone_text)
            if phones:
                company["phone"] = phones[0]

        website_el = listing.css('a[data-tooltip*="web"]')
        if not website_el:
            website_el = listing.css('a[href*="http"]')
        if website_el:
            href = website_el[0].attrib.get("href", "")
            if href and "google.com" not in href and "gstatic.com" not in href:
                company["website"] = href
                company["source_url"] = href

        return company

    def search_specific(self, company_name, city=None):
        """Search for a specific company on Google Maps"""
        query = company_name
        if city:
            query += f" {city}"
        query += " Turkey"

        encoded = quote_plus(query)
        url = f"https://www.google.com/maps/search/{encoded}"

        try:
            page = self._fetch(url)
            listings = page.css('.Nv2PK')
            if not listings:
                listings = page.css('[jsaction*="mouseover"]')

            results = []
            for listing in listings[:5]:
                company = self._parse_listing(listing)
                if company and company.get("name"):
                    results.append(company)
            return results
        except Exception as e:
            print(f"    [!] Hata: {e}")
            return []

    def enrich_company(self, company):
        """Enrich a company with Google Maps data"""
        if not company.get("name"):
            return company

        results = self.search_specific(company["name"], company.get("city"))
        if results:
            best = results[0]
            for key in ["address", "phone", "website", "description"]:
                if best.get(key) and not company.get(key):
                    company[key] = best[key]
        rate_limit_delay(2, 4)
        return company
