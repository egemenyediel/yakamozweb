import time
import importlib

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from src.utils.database import Database
from src.utils.helpers import extract_domain, rate_limit_delay


class ContactRotator:
    """
    Rotate between contact-finding services automatically.
    When one service is rate-limited, moves to the next one.
    """

    SERVICES_ORDER = [
        "hunterio",
        "snovio",
        "apolloio",
        "clearbit",
        "rocketreach",
        "ninjapear",
    ]

    def __init__(self, db: Database):
        self.db = db
        self._services = {}
        self._exhausted = set()
        self._load_services()

    def _load_services(self):
        config_services = importlib.import_module("config.services")
        available = config_services.get_contact_services()
        for svc in available:
            name = svc.name.lower().replace(".", "").replace(" ", "")
            self._services[name] = svc
            print(f"    [+] {svc.name} servisi aktif")

        if not self._services:
            print("    [!] Hicbir API servisi aktif degil!")
            print("    [>] .env dosyasi veya environment variable ile API keyleri ayarlayin")

    def get_active_services(self):
        active = []
        for name in self.SERVICES_ORDER:
            svc = self._services.get(name)
            if svc and name not in self._exhausted:
                active.append((name, svc))
        return active

    def find_contacts_for_domain(self, domain, company_id=None):
        """Try all services to find contacts for a domain, rotating on rate limit"""
        results = []

        for name, svc in self.get_active_services():
            try:
                print(f"      [>] {svc.name} ile aranıyor: {domain}")
                result = svc.search_domain(domain)

                if result.get("error") == "rate_limited":
                    print(f"      [!] {svc.name} limiti doldu, siradaki servis geciliyor...")
                    self._exhausted.add(name)
                    self.db.update_service_limit(name, "monthly", 0)
                    continue

                emails = result.get("emails", [])
                for email_data in emails:
                    if email_data.get("email"):
                        contact = {
                            "company_id": company_id,
                            "first_name": email_data.get("first_name", ""),
                            "last_name": email_data.get("last_name", ""),
                            "full_name": f"{email_data.get('first_name', '')} {email_data.get('last_name', '')}".strip(),
                            "email": email_data["email"],
                            "phone": email_data.get("phone", ""),
                            "position": email_data.get("position", ""),
                            "linkedin": email_data.get("linkedin", ""),
                            "confidence": str(email_data.get("confidence", "")),
                            "source": name,
                        }
                        self.db.upsert_contact(contact)
                        results.append(contact)

                if results:
                    print(f"      [+] {svc.name}: {len(emails)} kontak bulundu")
                    rate_limit_delay(1, 2)
                    break

            except Exception as e:
                print(f"      [!] {svc.name} hatasi: {e}")
                continue

            rate_limit_delay(1.5, 3)

        return results

    def find_person(self, first_name, last_name, domain, company_id=None):
        """Try all services to find a specific person's email"""
        for name, svc in self.get_active_services():
            try:
                result = svc.search_person(first_name, last_name, domain)

                if result.get("error") == "rate_limited":
                    self._exhausted.add(name)
                    continue

                if result.get("email"):
                    contact = {
                        "company_id": company_id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "full_name": f"{first_name} {last_name}",
                        "email": result["email"],
                        "confidence": str(result.get("confidence", "")),
                        "source": name,
                    }
                    self.db.upsert_contact(contact)
                    return contact

            except Exception as e:
                print(f"      [!] {svc.name} hatasi: {e}")
                continue

            rate_limit_delay(1.5, 3)

        return None

    def batch_find_contacts(self, limit=50):
        """Find contacts for all companies in DB that don't have contacts yet"""
        companies = self.db.get_companies_without_contacts(limit=limit)
        total_contacts = 0
        total_companies = 0

        for company in companies:
            domain = extract_domain(company.get("website", ""))
            if not domain:
                continue

            print(f"    [>] {company['name']} ({domain})")
            contacts = self.find_contacts_for_domain(domain, company_id=company["id"])

            if contacts:
                total_contacts += len(contacts)
                total_companies += 1

            rate_limit_delay(2, 4)

        active = len(self.get_active_services())
        if active == 0:
            print("\n    [!] Tum servislerin limiti doldu!")
            print("    [>] Yeni ay baslangicini bekleyin veya yeni API key ekleyin")

        self.db.log_scrape("contact_rotator", f"batch_{limit}", total_contacts, "success")
        return total_contacts, total_companies

    def check_service_status(self):
        """Check status of all configured services"""
        statuses = []
        for name, svc in self._services.items():
            try:
                status = svc.get_status()
                statuses.append(status)
                remaining = status.get("requests_remaining", "?")
                print(f"    {svc.name}: {remaining} kalan istek")
            except Exception as e:
                statuses.append({"service": svc.name, "error": str(e), "active": False})
                print(f"    {svc.name}: Hata - {e}")
        return statuses

    def reset_exhausted(self):
        """Reset exhausted services (e.g., at the start of a new month)"""
        self._exhausted.clear()
        print("    [+] Tum servisler sifirlandi")
