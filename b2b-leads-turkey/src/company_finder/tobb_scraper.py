import re
import time
from urllib.parse import quote_plus
from datetime import datetime

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from src.utils.database import Database
from src.utils.helpers import (
    clean_company_name, extract_emails_from_text, extract_phones_from_text,
    rate_limit_delay, normalize_sector,
)


class TOBBScraper:
    BASE_URL = "https://www.tobb.org.tr/TurkiyeTicaretSicilGazetesi"
    INDEX_URL = f"{BASE_URL}/Sayfalar/Eng/indeksveritabani.html"

    def __init__(self, db: Database):
        self.db = db

    def _fetch(self, url, timeout=20):
        from scrapling.fetchers import Fetcher
        return Fetcher.get(url, stealthy_headers=True, timeout=timeout)

    def search_companies(self, company_name=None, city=None, sector=None, date_from=None, date_to=None, max_pages=5):
        """Search TOBB Trade Registry Gazette Index Database"""
        total = 0

        params = {}
        if company_name:
            params["txtUnvan"] = company_name
        if city:
            params["txtIl"] = city
        if sector:
            params["txtSektor"] = sector

        search_url = f"{self.BASE_URL}/Sayfalar/Eng/indeksveritabani.html"
        if params:
            query_string = "&".join(f"{k}={quote_plus(v)}" for k, v in params.items())
            search_url = f"{search_url}?{query_string}"

        try:
            page = self._fetch(search_url)
            if page.status != 200:
                print(f"    [!] HTTP {page.status}")
                return 0

            rows = page.css("table tr")
            for row in rows[1:]:
                cells = row.css("td")
                if len(cells) >= 3:
                    company = {
                        "name": clean_company_name(cells[0].text if cells[0] else ""),
                        "registry_number": cells[1].text if len(cells) > 1 else "",
                        "city": cells[2].text if len(cells) > 2 else "",
                        "source": "tobb",
                        "source_url": search_url,
                    }
                    if len(cells) > 3:
                        company["sector"] = normalize_sector(cells[3].text)
                    company = {k: v for k, v in company.items() if v}
                    if company.get("name"):
                        self.db.upsert_company(company)
                        total += 1

            print(f"    [+] {total} firma bulundu")

        except Exception as e:
            print(f"    [!] Hata: {e}")
            self.db.log_scrape("tobb", str(params), 0, "error", str(e))
            return 0

        self.db.log_scrape("tobb", str(params), total, "success")
        return total

    def scrape_gazette_page(self, gazette_date=None, gazette_number=None):
        """Scrape a specific Trade Registry Gazette issue"""
        if gazette_number:
            url = f"{self.BASE_URL}/Sayfalar/GazeteDetay.aspx?GazeteNo={gazette_number}"
        elif gazette_date:
            url = f"{self.BASE_URL}/Sayfalar/GazeteDetay.aspx?Tarih={gazette_date}"
        else:
            url = f"{self.BASE_URL}/Sayfalar/GazeteDetay.aspx"

        try:
            page = self._fetch(url)
            if page.status != 200:
                return 0

            content = page.text if True else ""
            emails = extract_emails_from_text(content)
            phones = extract_phones_from_text(content)

            entries = page.css('.gazeteDetay, .ilanMetni, .content')
            total = 0

            for entry in entries:
                text = entry.text if True else str(entry)

                company_name = self._extract_company_from_gazette(text)
                if company_name:
                    company = {
                        "name": clean_company_name(company_name),
                        "source": "tobb_gazette",
                        "source_url": url,
                    }

                    found_emails = extract_emails_from_text(text)
                    found_phones = extract_phones_from_text(text)

                    if found_emails:
                        company["email"] = found_emails[0]
                    if found_phones:
                        company["phone"] = found_phones[0]
                    if "MERSİS" in text or "mersis" in text:
                        mersis = re.search(r"\d{16}", text)
                        if mersis:
                            company["tax_number"] = mersis.group()

                    self.db.upsert_company(company)
                    total += 1

            rate_limit_delay(3, 5)
            return total

        except Exception as e:
            print(f"    [!] Hata: {e}")
            return 0

    def _extract_company_from_gazette(self, text):
        """Extract company name from gazette text"""
        patterns = [
            r"([A-ZÇĞİÖŞÜa-zçğıöşü\s]+(?:A\.Ş\.|Ltd\.Şti\.|Ltd\.|Şti\.|A\.S\.))",
            r"UNVAN[:\s]+([^\n,]+)",
            r"ŞİRKET[:\s]+([^\n,]+)",
            r"FİRMA[:\s]+([^\n,]+)",
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()
        return ""

    def scrape_latest(self, count=3):
        """Scrape the latest gazette issues"""
        total = 0
        try:
            page = self._fetch(f"{self.BASE_URL}/Sayfalar/Eng/AnaSayfa.php")
            links = page.css('a[href*="GazeteNo"], a[href*="GazeteTarih"]')

            for link in links[:count]:
                href = link.attrib.get("href", "")
                if href:
                    if not href.startswith("http"):
                        href = f"{self.BASE_URL}/Sayfalar/{href}"
                    gazette_no = re.search(r"GazeteNo=(\d+)", href)
                    if gazette_no:
                        scraped = self.scrape_gazette_page(gazette_number=gazette_no.group(1))
                        total += scraped
                        print(f"    [+] Gazete #{gazette_no.group(1)}: {scraped} kayıt")
                    rate_limit_delay(5, 8)

        except Exception as e:
            print(f"    [!] Hata: {e}")

        return total
