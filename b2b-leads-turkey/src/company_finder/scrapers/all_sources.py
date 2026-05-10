"""
B2B Leads Turkey - Tüm Veri Kaynakları

Her kaynak bir scraper sınıfı olarak implement edilir.
Tüm scraper'lar BaseScraper'dan inherit alır.
"""

import os
import sys
import re
import json
import time
from datetime import datetime
from abc import ABC, abstractmethod
from urllib.parse import quote_plus, urljoin

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))

from src.utils.database import Database
from src.utils.helpers import (
    clean_company_name, extract_emails_from_text,
    extract_phones_from_text, extract_domain,
    normalize_sector, rate_limit_delay, safe_text,
)


class BaseScraper(ABC):
    """Tüm scraper'ların base sınıfı"""

    name: str = ""
    description: str = ""
    source_url: str = ""
    source_type: str = "scraper"  # scraper, api, dataset

    def __init__(self, db: Database):
        self.db = db

    def _fetch(self, url, timeout=20):
        from scrapling.fetchers import Fetcher
        return Fetcher.get(url, stealthy_headers=True, timeout=timeout)

    @abstractmethod
    def search(self, **kwargs) -> int:
        """Arama yap, bulunan firma sayısını döndür"""
        pass

    def _save_company(self, company: dict) -> int:
        company["source"] = self.name
        if not company.get("source_url"):
            company["source_url"] = self.source_url
        company = {k: v for k, v in company.items() if v and str(v) != "nan"}
        if company.get("name"):
            return self.db.upsert_company(company)
        return 0

    def info(self):
        return {
            "name": self.name,
            "description": self.description,
            "source_url": self.source_url,
            "source_type": self.source_type,
        }


# ════════════════════════════════════════════════════════════════
# 1. TOBB TİCARET SİCİL GAZETESİ
# ════════════════════════════════════════════════════════════════

class TOBBScraper(BaseScraper):
    name = "tobb"
    description = "TOBB Türkiye Ticaret Sicil Gazetesi - Yeni kurulan/güncellenen şirketler"
    source_url = "https://www.tobb.org.tr/TurkiyeTicaretSicilGazetesi"
    source_type = "scraper"

    BASE_URL = "https://www.tobb.org.tr/TurkiyeTicaretSicilGazetesi"

    def search(self, company_name=None, city=None, sector=None, **kwargs):
        params = {}
        if company_name:
            params["txtUnvan"] = company_name
        if city:
            params["txtIl"] = city
        if sector:
            params["txtSektor"] = sector

        search_url = f"{self.BASE_URL}/Sayfalar/Eng/indeksveritabani.html"
        if params:
            qs = "&".join(f"{k}={quote_plus(v)}" for k, v in params.items())
            search_url = f"{search_url}?{qs}"

        total = 0
        try:
            page = self._fetch(search_url)
            if page.status != 200:
                return 0

            rows = page.css("table tr")
            for row in rows[1:]:
                cells = row.css("td")
                if len(cells) >= 3:
                    company = {
                        "name": clean_company_name(cells[0].text if cells[0].text else ""),
                        "registry_number": cells[1].text if len(cells) > 1 else "",
                        "city": cells[2].text if len(cells) > 2 else "",
                    }
                    if len(cells) > 3:
                        company["sector"] = normalize_sector(cells[3].text)
                    self._save_company(company)
                    total += 1

        except Exception as e:
            self.db.log_scrape(self.name, str(params), 0, "error", str(e))
            return 0

        self.db.log_scrape(self.name, str(params), total, "success")
        return total


# ════════════════════════════════════════════════════════════════
# 2. RESMİ GAZETE
# ════════════════════════════════════════════════════════════════

class ResmiGazeteScraper(BaseScraper):
    name = "resmi_gazete"
    description = "Resmi Gazete - Şirket kuruluş, değişiklik ve tasfiye ilanları"
    source_url = "https://www.resmigazete.gov.tr"
    source_type = "scraper"

    BASE_URL = "https://www.resmigazete.gov.tr"
    SEARCH_URL = "https://www.resmigazete.gov.tr/eskiler/arama.aspx"

    def search(self, query="şirket", date_from=None, date_to=None, **kwargs):
        total = 0
        try:
            url = f"{self.SEARCH_URL}?aranan={quote_plus(query)}"
            if date_from:
                url += f"&tarih1={date_from}"
            if date_to:
                url += f"&tarih2={date_to}"

            page = self._fetch(url)
            if page.status != 200:
                return 0

            results = page.css('.search-result, .sonuc, .ilan, article, .content-item')
            if not results:
                links = page.css('a[href*="eskiler"]')
                for link in links[:20]:
                    href = link.attrib.get("href", "")
                    text = link.text or ""
                    if any(kw in text.lower() for kw in ["a.ş", "ltd", "şti", "anonim", "limited"]):
                        company = self._parse_gazette_text(text)
                        if company:
                            self._save_company(company)
                            total += 1
            else:
                for result in results:
                    text = result.text or ""
                    company = self._parse_gazette_text(text)
                    if company:
                        self._save_company(company)
                        total += 1

        except Exception as e:
            self.db.log_scrape(self.name, query, 0, "error", str(e))
            return 0

        self.db.log_scrape(self.name, query, total, "success")
        return total

    def _parse_gazette_text(self, text):
        patterns = [
            r"([A-ZÇĞİÖŞÜa-zçğıöşü\s]+(?:A\.Ş\.|Ltd\.Şti\.|Ltd\.|Şti\.))",
            r"ünvan[ıi][:\s]+([^\n,]+?)(?:\s+(?:merkez|şube|tasfiye|kuruluş))",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                if len(name) > 3:
                    company = {
                        "name": clean_company_name(name),
                        "source_url": self.source_url,
                    }
                    emails = extract_emails_from_text(text)
                    if emails:
                        company["email"] = emails[0]
                    phones = extract_phones_from_text(text)
                    if phones:
                        company["phone"] = phones[0]
                    return company
        return None


# ════════════════════════════════════════════════════════════════
# 3. KAP - KAMU AYDINLATMA PLATFORMU (BİST ŞİRKETLERİ)
# ════════════════════════════════════════════════════════════════

class KAPScraper(BaseScraper):
    name = "kap"
    description = "KAP - Borsa İstanbul halka açık şirketler, yönetim kurulu, finansal veriler"
    source_url = "https://www.kap.org.tr"
    source_type = "scraper"

    BASE_URL = "https://www.kap.org.tr"

    BIST_COMPANIES_URL = "https://www.kap.org.tr/tr/bist-sirketler"

    def search(self, sector=None, **kwargs):
        total = 0
        try:
            page = self._fetch(self.BIST_COMPANIES_URL)
            if page.status != 200:
                return 0

            rows = page.css('table tbody tr, .company-list-item, .sirket-row')
            if not rows:
                links = page.css('a[href*="/tr/sirket/"]')
                for link in links:
                    company = self._parse_kap_link(link)
                    if company:
                        if sector and company.get("sector") != sector:
                            continue
                        self._save_company(company)
                        total += 1
            else:
                for row in rows:
                    cells = row.css("td")
                    if cells:
                        company = {
                            "name": clean_company_name(cells[0].text if cells[0].text else ""),
                            "source_url": self.source_url,
                        }
                        if len(cells) > 1:
                            company["sector"] = cells[1].text if cells[1].text else ""
                        if len(cells) > 2:
                            company["city"] = cells[2].text if cells[2].text else ""
                        self._save_company(company)
                        total += 1

        except Exception as e:
            self.db.log_scrape(self.name, "bist_companies", 0, "error", str(e))
            return 0

        self.db.log_scrape(self.name, "bist_companies", total, "success")
        return total

    def _parse_kap_link(self, link):
        href = link.attrib.get("href", "")
        text = link.text or ""
        if not text or len(text) < 3:
            return None
        return {
            "name": clean_company_name(text.strip()),
            "source_url": f"{self.BASE_URL}{href}" if href.startswith("/") else href,
        }

    def search_company_detail(self, kap_slug):
        """Şirket detay sayfasından yönetim kurulu üyelerini çek"""
        try:
            url = f"{self.BASE_URL}/tr/sirket/{kap_slug}/yonetim-kurulu"
            page = self._fetch(url)
            if page.status != 200:
                return []

            members = page.css('.board-member, .yonetim-kurulu-uye, table tr')
            contacts = []
            for member in members:
                name_el = member.css("td, .name, .isim")
                title_el = member.css(".title, .unvan, .gorev")
                if name_el:
                    full_name = name_el[0].text.strip() if name_el[0].text else ""
                    position = title_el[0].text.strip() if title_el and title_el[0].text else ""
                    if full_name and len(full_name) > 3:
                        contacts.append({
                            "full_name": full_name,
                            "position": position,
                            "source": "kap_yk",
                        })
            return contacts
        except Exception:
            return []


# ════════════════════════════════════════════════════════════════
# 4. SPK - SERMAYE PİYASASI KURULU
# ════════════════════════════════════════════════════════════════

class SPKScraper(BaseScraper):
    name = "spk"
    description = "SPK - Sermaye Piyasası Kurulu lisanslı kurumlar (aracı kurumlar, YATIRIM fonları, portföy yönetim)"
    source_url = "https://www.spk.gov.tr"
    source_type = "scraper"

    BASE_URL = "https://www.spk.gov.tr"

    LIST_URLS = {
        "araci_kurumlar": "https://www.spk.gov.tr/tr/kurululusliste",
        "portfoy_yonetim": "https://www.spk.gov.tr/tr/kurululusliste",
        "yatirim_fonlari": "https://www.spk.gov.tr/tr/kurululusliste",
        "denetim_kurulu": "https://www.spk.gov.tr/tr/kurululusliste",
    }

    def search(self, query=None, institution_type=None, **kwargs):
        total = 0

        url = self.LIST_URLS.get(institution_type, self.LIST_URLS["araci_kurumlar"])
        try:
            page = self._fetch(url)
            if page.status != 200:
                return 0

            tables = page.css('table')
            for table in tables:
                rows = table.css("tr")
                for row in rows[1:]:
                    cells = row.css("td")
                    if cells:
                        company = {
                            "name": clean_company_name(cells[0].text if cells[0].text else ""),
                            "sector": "Finans",
                            "source_url": self.source_url,
                        }
                        if len(cells) > 1:
                            company["city"] = cells[1].text if cells[1].text else ""
                        if len(cells) > 2:
                            company["phone"] = cells[2].text if cells[2].text else ""
                        if len(cells) > 3:
                            company["website"] = cells[3].text if cells[3].text else ""

                        if query and query.lower() not in (company.get("name", "").lower()):
                            continue

                        self._save_company(company)
                        total += 1

        except Exception as e:
            self.db.log_scrape(self.name, str(institution_type), 0, "error", str(e))
            return 0

        self.db.log_scrape(self.name, str(institution_type), total, "success")
        return total


# ════════════════════════════════════════════════════════════════
# 5. BDDK - BANKACILIK DÜZENLEME VE DENETLEME KURUMU
# ════════════════════════════════════════════════════════════════

class BDDKScraper(BaseScraper):
    name = "bddk"
    description = "BDDK - Bankalar, finansal kurumlar, faktoring şirketleri listesi"
    source_url = "https://www.bddk.org.tr"
    source_type = "scraper"

    BASE_URL = "https://www.bddk.org.tr"

    LIST_URLS = {
        "bankalar": "https://www.bddk.org.tr/BankaVeFinansalSektorBilgileri/Bankalar",
        "faktoring": "https://www.bddk.org.tr/BankaVeFinansalSektorBilgileri/FaktoringSirketleri",
        "finansal_kiralama": "https://www.bddk.org.tr/BankaVeFinansalSektorBilgileri/FinansalKiralamaSirketleri",
        "varlik_yonetim": "https://www.bddk.org.tr/BankaVeFinansalSektorBilgileri/VarlikYonetimSirketleri",
        "odemeler": "https://www.bddk.org.tr/BankaVeFinansalSektorBilgileri/OdemeHizmetleri",
    }

    def search(self, institution_type=None, **kwargs):
        total = 0
        urls = {institution_type: self.LIST_URLS[institution_type]} if institution_type else self.LIST_URLS

        for inst_type, url in urls.items():
            try:
                page = self._fetch(url)
                if page.status != 200:
                    continue

                rows = page.css("table tr")
                for row in rows[1:]:
                    cells = row.css("td")
                    if cells:
                        company = {
                            "name": clean_company_name(cells[0].text if cells[0].text else ""),
                            "sector": "Finans",
                            "description": inst_type.replace("_", " ").title(),
                            "source_url": url,
                        }
                        for i, cell in enumerate(cells[1:], 1):
                            text = cell.text if cell.text else ""
                            links = cell.css("a")
                            if links:
                                href = links[0].attrib.get("href", "")
                                if "http" in href and not company.get("website"):
                                    company["website"] = href
                                elif text and "@" in text and not company.get("email"):
                                    company["email"] = text.strip()
                                elif text and not company.get("city") and i == 1:
                                    company["city"] = text.strip()

                        self._save_company(company)
                        total += 1

                rate_limit_delay(1, 2)
            except Exception as e:
                self.db.log_scrape(self.name, inst_type, 0, "error", str(e))
                continue

        self.db.log_scrape(self.name, str(list(urls.keys())), total, "success")
        return total


# ════════════════════════════════════════════════════════════════
# 6. BTK - BİLGİ TEKNOLOJİLERİ VE İLETİŞİM KURUMU
# ════════════════════════════════════════════════════════════════

class BTKScraper(BaseScraper):
    name = "btk"
    description = "BTK - Telekomünikasyon ve İT lisanslı işletmeler, ISP'ler, operatörler"
    source_url = "https://www.btk.gov.tr"
    source_type = "scraper"

    BASE_URL = "https://www.btk.gov.tr"

    def search(self, query=None, **kwargs):
        total = 0
        try:
            url = f"{self.BASE_URL}/lisansli-isletmeciler"
            page = self._fetch(url)
            if page.status != 200:
                return 0

            rows = page.css("table tr")
            for row in rows[1:]:
                cells = row.css("td")
                if cells:
                    company = {
                        "name": clean_company_name(cells[0].text if cells[0].text else ""),
                        "sector": "Teknoloji",
                        "source_url": self.source_url,
                    }
                    if len(cells) > 1:
                        company["city"] = cells[1].text if cells[1].text else ""
                    if len(cells) > 2:
                        company["website"] = cells[2].text if cells[2].text else ""

                    if query and query.lower() not in (company.get("name", "").lower()):
                        continue

                    self._save_company(company)
                    total += 1

        except Exception as e:
            self.db.log_scrape(self.name, query or "all", 0, "error", str(e))
            return 0

        self.db.log_scrape(self.name, query or "all", total, "success")
        return total


# ════════════════════════════════════════════════════════════════
# 7. EPDK - ENERJİ PİYASASI DÜZENLEME KURUMU
# ════════════════════════════════════════════════════════════════

class EPDKScraper(BaseScraper):
    name = "epdk"
    description = "EPDK - Elektrik, doğalgaz, petrol piyasası lisanslı şirketler"
    source_url = "https://www.epdk.gov.tr"
    source_type = "scraper"

    BASE_URL = "https://www.epdk.gov.tr"

    LIST_URLS = {
        "elektrik_uretim": "https://www.epdk.gov.tr/Detay/Icerik/3-0-122/elektrik-uretim",
        "elektrik_dagitim": "https://www.epdk.gov.tr/Detay/Icerik/3-0-123/elektrik-dagitim",
        "elektrik_perakende": "https://www.epdk.gov.tr/Detay/Icerik/3-0-124/elektrik-perakende-satis",
        "dogalgaz_dagitim": "https://www.epdk.gov.tr/Detay/Icerik/3-0-128/dogalgaz-dagitim",
        "dogalgaz_perakende": "https://www.epdk.gov.tr/Detay/Icerik/3-0-129/dogalgaz-perakende-satis",
        "petrol_bayilik": "https://www.epdk.gov.tr/Detay/Icerik/3-0-133/petrol-bayilik",
    }

    def search(self, sector_type=None, **kwargs):
        total = 0
        urls = {sector_type: self.LIST_URLS[sector_type]} if sector_type else self.LIST_URLS

        for s_type, url in urls.items():
            try:
                page = self._fetch(url)
                if page.status != 200:
                    continue

                rows = page.css("table tr")
                for row in rows[1:]:
                    cells = row.css("td")
                    if cells:
                        company = {
                            "name": clean_company_name(cells[0].text if cells[0].text else ""),
                            "sector": "Enerji",
                            "description": s_type.replace("_", " ").title(),
                            "source_url": url,
                        }
                        if len(cells) > 1:
                            company["city"] = cells[1].text if cells[1].text else ""
                        if len(cells) > 2:
                            company["website"] = cells[2].text if cells[2].text else ""

                        self._save_company(company)
                        total += 1

                rate_limit_delay(1, 2)
            except Exception as e:
                self.db.log_scrape(self.name, s_type, 0, "error", str(e))
                continue

        self.db.log_scrape(self.name, str(list(urls.keys())), total, "success")
        return total


# ════════════════════════════════════════════════════════════════
# 8. TİCARET ODALARI (İTO, ATO, İZTO vb.)
# ════════════════════════════════════════════════════════════════

class TicaretOdasiScraper(BaseScraper):
    name = "ticaret_odalari"
    description = "Ticaret Odaları - İTO, ATO, İZTO, BTO üye firmaları"
    source_url = "https://www.tobb.org.tr"
    source_type = "scraper"

    CHAMBERS = {
        "ito": {"name": "İstanbul Ticaret Odası", "url": "https://www.ito.org.tr"},
        "ato": {"name": "Ankara Ticaret Odası", "url": "https://www.atonet.org.tr"},
        "izto": {"name": "İzmir Ticaret Odası", "url": "https://www.izto.org.tr"},
        "bto": {"name": "Bursa Ticaret Odası", "url": "https://www.btobbursa.org.tr"},
        "antalya_to": {"name": "Antalya Ticaret Odası", "url": "https://www.atb.org.tr"},
        "konya_to": {"name": "Konya Ticaret Odası", "url": "https://www.kto.org.tr"},
        "gaziantep_to": {"name": "Gaziantep Ticaret Odası", "url": "https://www.gto.org.tr"},
        "adana_to": {"name": "Adana Ticaret Odası", "url": "https://www.adanatobb.org.tr"},
        "kayseri_to": {"name": "Kayseri Ticaret Odası", "url": "https://www.kayso.org.tr"},
        "mersin_to": {"name": "Mersin Ticaret Odası", "url": "https://www.mtso.org.tr"},
    }

    TOBB_MEMBER_SEARCH = "https://www.tobb.org.tr/sayfalar/TobbUyeArama/"

    def search(self, city=None, sector=None, query=None, **kwargs):
        total = 0

        if query or city:
            total += self._search_tobb(query=query, city=city)

        if not query and not city:
            for chamber_key, chamber in self.CHAMBERS.items():
                try:
                    count = self._search_chamber(chamber_key, chamber)
                    total += count
                except Exception:
                    continue
                rate_limit_delay(2, 4)

        self.db.log_scrape(self.name, f"city={city},sector={sector}", total, "success")
        return total

    def _search_tobb(self, query=None, city=None):
        total = 0
        try:
            url = self.TOB_MEMBER_SEARCH
            if query:
                url += f"?aranan={quote_plus(query)}"
            if city:
                url += f"&il={quote_plus(city)}"

            page = self._fetch(url)
            results = page.css('.sonuc, .result, table tr')
            for r in results:
                text = r.text or ""
                name_match = re.search(r"([A-ZÇĞİÖŞÜa-zçğıöşü\s]+(?:A\.Ş\.|Ltd\.|Şti\.))", text)
                if name_match:
                    company = {
                        "name": clean_company_name(name_match.group(1)),
                        "source_url": self.source_url,
                    }
                    if city:
                        company["city"] = city
                    self._save_company(company)
                    total += 1
        except Exception:
            pass
        return total

    def _search_chamber(self, chamber_key, chamber):
        total = 0
        try:
            url = chamber["url"]
            page = self._fetch(url)
            if page.status != 200:
                return 0

            links = page.css('a')
            member_links = [a for a in links if any(kw in (a.text or "").lower() for kw in ["üye", "firma", "rehber", "member"])]
            if not member_links:
                return 0

            for ml in member_links[:3]:
                href = ml.attrib.get("href", "")
                if not href.startswith("http"):
                    href = urljoin(url, href)
                try:
                    sub_page = self._fetch(href)
                    if sub_page.status == 200:
                        text = sub_page.text or ""
                        names = re.findall(r"([A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜa-zçğıöşü\s]{2,}(?:A\.Ş\.|Ltd\.|Şti\.))", text)
                        for name in names[:20]:
                            company = {
                                "name": clean_company_name(name.strip()),
                                "city": chamber["name"].split(" ")[0],
                                "source_url": href,
                            }
                            self._save_company(company)
                            total += 1
                except Exception:
                    continue
                rate_limit_delay(2, 4)
        except Exception:
            pass
        return total


# ════════════════════════════════════════════════════════════════
# 9. SARISAYFALAR & FİRMA REHBERLERİ
# ════════════════════════════════════════════════════════════════

class SariSayfalarScraper(BaseScraper):
    name = "sarisayfalar"
    description = "Sarı Sayfalar, TurkCompany, Firmarehberi - Genel firma dizinleri"
    source_url = "https://www.sarisayfalar.com.tr"
    source_type = "scraper"

    DIRECTORIES = {
        "sarisayfalar": {"name": "Sarı Sayfalar", "url": "https://www.sarisayfalar.com.tr", "search_path": "/ara/"},
        "turkcompany": {"name": "TurkishCompany", "url": "https://www.turkcompany.net", "search_path": "/search/"},
        "firmarehberi": {"name": "Firma Rehberi", "url": "https://www.firmarehberi.com", "search_path": "/ara/"},
        "firmabilgi": {"name": "Firma Bilgi", "url": "https://www.firmabilgi.com", "search_path": "/search?q="},
        "sektorcu": {"name": "Sektörcü", "url": "https://www.sektorcu.com.tr", "search_path": "/firma-ara/"},
    }

    SECTOR_KEYWORDS = {
        "Teknoloji": ["yazılım", "bilişim", "teknoloji", "yazilim", "bilisim"],
        "Finans": ["finans", "banka", "yatırım", "sigorta", "muuhasebe"],
        "Savunma Sanayi": ["savunma", "askeri", "defence"],
        "Otomotiv": ["otomotiv", "oto", "araba", "araç"],
        "Inşaat": ["inşaat", "yapı", "insaat", "yapi"],
        "Sağlık": ["sağlık", "tıbbi", "hastane", "saglik"],
        "Enerji": ["enerji", "elektrik", "güneş", "enerji"],
        "Gıda": ["gıda", "yiyecek", "gida", "tarım"],
        "Turizm": ["turizm", "otel", "seyahat", "turizim"],
    }

    def search(self, query=None, sector=None, city=None, directory=None, **kwargs):
        total = 0
        dirs = {directory: self.DIRECTORIES[directory]} if directory else self.DIRECTORIES

        search_terms = []
        if query:
            search_terms.append(query)
        if sector:
            keywords = self.SECTOR_KEYWORDS.get(sector, [sector])
            search_terms.extend(keywords[:2])
        if not search_terms:
            search_terms = ["firma"]

        for dir_key, dir_info in dirs.items():
            for term in search_terms[:3]:
                try:
                    count = self._search_directory(dir_key, dir_info, term, city)
                    total += count
                except Exception:
                    continue
                rate_limit_delay(3, 6)

        self.db.log_scrape(self.name, f"q={query},sector={sector}", total, "success")
        return total

    def _search_directory(self, dir_key, dir_info, query, city=None):
        total = 0
        search_url = f"{dir_info['url']}{dir_info['search_path']}{quote_plus(query)}"
        if city:
            search_url += f"+{quote_plus(city)}"

        try:
            page = self._fetch(search_url)
            if page.status != 200:
                return 0

            listings = page.css('.listing, .company, .firma, .result-item, .card, article, .item')
            if not listings:
                listings = page.css('div[class*="firm"], div[class*="list"]')

            for listing in listings[:30]:
                company = self._parse_listing(listing, dir_info["url"])
                if company and company.get("name"):
                    self._save_company(company)
                    total += 1

        except Exception:
            pass
        return total

    def _parse_listing(self, listing, base_url):
        company = {}

        name_els = listing.css('h2, h3, h4, .name, .title, .firma-adi, a strong')
        if name_els:
            company["name"] = clean_company_name(name_els[0].text.strip() if name_els[0].text else "")

        link_els = listing.css('a[href^="http"]')
        if not link_els:
            link_els = listing.css('a[href^="/"]')
        if link_els:
            href = link_els[0].attrib.get("href", "")
            if href.startswith("/"):
                href = urljoin(base_url, href)
            if "http" in href and base_url not in href:
                company["website"] = href

        text = listing.text or ""
        emails = extract_emails_from_text(text)
        if emails:
            company["email"] = emails[0]
        phones = extract_phones_from_text(text)
        if phones:
            company["phone"] = phones[0]

        if not company.get("name"):
            return None
        return company


# ════════════════════════════════════════════════════════════════
# 10. TURKISH EXPORTERS (TIM)
# ════════════════════════════════════════════════════════════════

class TurkishExportersScraper(BaseScraper):
    name = "turkish_exporters"
    description = "TIM - Türkiye İhracatçılar Meclisi, ihracatçı firma dizini"
    source_url = "https://www.tim.org.tr"
    source_type = "scraper"

    BASE_URL = "https://www.tim.org.tr"

    def search(self, sector=None, city=None, **kwargs):
        total = 0
        try:
            url = f"{self.BASE_URL}/tr/firma-ara"
            if sector:
                url += f"?sektor={quote_plus(sector)}"
            if city:
                url += f"&il={quote_plus(city)}"

            page = self._fetch(url)
            if page.status != 200:
                return 0

            listings = page.css('.firma, .company, .result, table tr')
            for listing in listings:
                cells = listing.css("td")
                if not cells:
                    name_el = listing.css("h3, h4, .name, a")
                    if name_el:
                        text = name_el[0].text or ""
                        if text.strip():
                            company = {
                                "name": clean_company_name(text.strip()),
                                "source_url": self.source_url,
                            }
                            if city:
                                company["city"] = city
                            self._save_company(company)
                            total += 1
                    continue

                company = {
                    "name": clean_company_name(cells[0].text if cells[0].text else ""),
                    "source_url": self.source_url,
                }
                if len(cells) > 1:
                    company["sector"] = cells[1].text if cells[1].text else ""
                if len(cells) > 2:
                    company["city"] = cells[2].text if cells[2].text else ""
                self._save_company(company)
                total += 1

        except Exception as e:
            self.db.log_scrape(self.name, f"sector={sector}", 0, "error", str(e))
            return 0

        self.db.log_scrape(self.name, f"sector={sector}", total, "success")
        return total


# ════════════════════════════════════════════════════════════════
# 11. SANAYİ ODALARI (OSİB, OSGB vb.)
# ════════════════════════════════════════════════════════════════

class SanayiOdasiScraper(BaseScraper):
    name = "sanayi_odalari"
    description = "Sanayi Odaları - ISO, ASO, İZSO, organize sanayi bölgeleri üyeleri"
    source_url = "https://www.iso.org.tr"
    source_type = "scraper"

    CHAMBERS = {
        "iso": {"name": "İstanbul Sanayi Odası", "url": "https://www.iso.org.tr", "city": "Istanbul"},
        "aso": {"name": "Ankara Sanayi Odası", "url": "https://www.aso.org.tr", "city": "Ankara"},
        "izso": {"name": "İzmir Sanayi Odası", "url": "https://www.izso.org.tr", "city": "Izmir"},
        "bso": {"name": "Bursa Sanayi Odası", "url": "https://www.bso.org.tr", "city": "Bursa"},
        "kso": {"name": "Kocaeli Sanayi Odası", "url": "https://www.kso.org.tr", "city": "Kocaeli"},
    }

    ISO_TOP_500_URL = "https://www.iso.org.tr/iso-500"

    def search(self, city=None, **kwargs):
        total = 0

        total += self._scrape_iso500()

        for key, chamber in self.CHAMBERS.items():
            if city and city.lower() not in chamber["city"].lower():
                continue
            try:
                count = self._search_chamber(key, chamber)
                total += count
            except Exception:
                continue
            rate_limit_delay(2, 4)

        self.db.log_scrape(self.name, f"city={city}", total, "success")
        return total

    def _scrape_iso500(self):
        total = 0
        try:
            page = self._fetch(self.ISO_TOP_500_URL)
            if page.status != 200:
                return 0

            rows = page.css("table tr")
            for row in rows[1:]:
                cells = row.css("td")
                if cells:
                    company = {
                        "name": clean_company_name(cells[0].text if cells[0].text else ""),
                        "source_url": self.ISO_TOP_500_URL,
                        "description": "ISO 500 Büyük Sanayi Kuruluşu",
                    }
                    if len(cells) > 1:
                        company["city"] = cells[1].text if cells[1].text else ""
                    if len(cells) > 2:
                        company["sector"] = cells[2].text if cells[2].text else ""
                    self._save_company(company)
                    total += 1
        except Exception:
            pass
        return total

    def _search_chamber(self, key, chamber):
        total = 0
        try:
            page = self._fetch(chamber["url"])
            if page.status != 200:
                return 0

            links = page.css('a')
            member_links = [a for a in links if any(kw in (a.text or "").lower() for kw in ["üye", "firma", "liste", "rehber"])]
            for ml in member_links[:2]:
                href = ml.attrib.get("href", "")
                if not href.startswith("http"):
                    href = urljoin(chamber["url"], href)
                try:
                    sub = self._fetch(href)
                    if sub.status == 200:
                        text = sub.text or ""
                        names = re.findall(r"([A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜa-zçğıöşü\s]{2,}(?:A\.Ş\.|Ltd\.|Şti\.))", text)
                        for name in names[:20]:
                            self._save_company({
                                "name": clean_company_name(name.strip()),
                                "city": chamber["city"],
                                "source_url": href,
                            })
                            total += 1
                except Exception:
                    continue
        except Exception:
            pass
        return total


# ════════════════════════════════════════════════════════════════
# 12. MARKA PATENT (TÜRKPATENT)
# ════════════════════════════════════════════════════════════════

class TurkpatentScraper(BaseScraper):
    name = "turkpatent"
    description = "TÜRKPATENT - Marka/Patent sahibi firmalar, Ar-Ge merkezleri"
    source_url = "https://www.turkpatent.gov.tr"
    source_type = "scraper"

    BASE_URL = "https://online.turkpatent.gov.tr"

    def search(self, query=None, **kwargs):
        total = 0
        try:
            url = f"{self.BASE_URL}/EPATS/marka?aranan={quote_plus(query or 'firma')}"
            page = self._fetch(url)
            if page.status != 200:
                return 0

            rows = page.css("table tr")
            for row in rows[1:]:
                cells = row.css("td")
                if cells:
                    company = {
                        "name": clean_company_name(cells[0].text if cells[0].text else ""),
                        "source_url": self.source_url,
                    }
                    self._save_company(company)
                    total += 1

        except Exception as e:
            self.db.log_scrape(self.name, query or "all", 0, "error", str(e))
            return 0

        self.db.log_scrape(self.name, query or "all", total, "success")
        return total


# ════════════════════════════════════════════════════════════════
# SCRAPER REGISTRY
# ════════════════════════════════════════════════════════════════

SCRAPER_REGISTRY = {
    "tobb": TOBBScraper,
    "resmi_gazete": ResmiGazeteScraper,
    "kap": KAPScraper,
    "spk": SPKScraper,
    "bddk": BDDKScraper,
    "btk": BTKScraper,
    "epdk": EPDKScraper,
    "ticaret_odalari": TicaretOdasiScraper,
    "sarisayfalar": SariSayfalarScraper,
    "turkish_exporters": TurkishExportersScraper,
    "sanayi_odalari": SanayiOdasiScraper,
    "turkpatent": TurkpatentScraper,
}


def get_all_scrapers(db):
    return {key: cls(db) for key, cls in SCRAPER_REGISTRY.items()}


def get_scraper(name, db):
    cls = SCRAPER_REGISTRY.get(name)
    if cls:
        return cls(db)
    return None
