import re
import time
import random
from urllib.parse import urlparse


def extract_domain(url):
    if not url:
        return ""
    if not url.startswith("http"):
        url = "https://" + url
    parsed = urlparse(url)
    return parsed.netloc.replace("www.", "")


def clean_company_name(name):
    if not name:
        return ""
    name = name.strip()
    suffixes = ["A.Ş.", "A.S.", "Ltd. Şti.", "Ltd. Sti.", "Ltd.", "Şti.", "Sti.", "Inc.", "LLC", "GmbH", "A.Ş", "A.S"]
    for suffix in suffixes:
        if name.upper().endswith(suffix.upper()):
            name = name[: -len(suffix)].strip()
    return name


def extract_emails_from_text(text):
    if not text:
        return []
    pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    return list(set(re.findall(pattern, text)))


def extract_phones_from_text(text):
    if not text:
        return []
    patterns = [
        r"\+90\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}",
        r"0\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}",
        r"\(\d{3}\)\s?\d{3}\s?\d{2}\s?\d{2}",
        r"\d{3}-\d{3}-\d{2}-\d{2}",
    ]
    phones = []
    for pattern in patterns:
        phones.extend(re.findall(pattern, text))
    return list(set(phones))


def rate_limit_delay(min_sec=1.5, max_sec=4.0):
    time.sleep(random.uniform(min_sec, max_sec))


def normalize_sector(sector):
    mapping = {
        "teknoloji": "Teknoloji",
        "yazilim": "Teknoloji",
        "bilisim": "Teknoloji",
        "technology": "Teknoloji",
        "finans": "Finans",
        "bankacilik": "Finans",
        "finance": "Finans",
        "savunma": "Savunma Sanayi",
        "defense": "Savunma Sanayi",
        "otomotiv": "Otomotiv",
        "automotive": "Otomotiv",
        "insaat": "Inşaat",
        "construction": "Inşaat",
        "saglik": "Sağlık",
        "healthcare": "Sağlık",
        "egitim": "Eğitim",
        "education": "Eğitim",
        "perakende": "Perakende",
        "retail": "Perakende",
        "lojistik": "Lojistik",
        "logistics": "Lojistik",
        "enerji": "Enerji",
        "energy": "Enerji",
        "gida": "Gıda",
        "food": "Gıda",
        "tekstil": "Tekstil",
        "textile": "Tekstil",
        "turizm": "Turizm",
        "tourism": "Turizm",
        "kimya": "Kimya",
        "chemistry": "Kimya",
        "madencilik": "Madencilik",
        "mining": "Madencilik",
    }
    return mapping.get(sector.lower(), sector.title())


def safe_text(element):
    if element is None:
        return ""
    text = element.get_text(strip=True) if hasattr(element, "get_text") else str(element)
    return text.strip() if text else ""


def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i: i + n]
