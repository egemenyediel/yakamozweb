import os
import pandas as pd
from datetime import datetime

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from src.utils.database import Database
from src.utils.helpers import clean_company_name, normalize_sector, extract_domain


class KaggleLoader:
    def __init__(self, db: Database):
        self.db = db

    def load_companies_turkey(self, filepath):
        """Load Kaggle 'Companies in Turkey' dataset"""
        if not os.path.exists(filepath):
            print(f"  [!] Dosya bulunamadi: {filepath}")
            print(f"  [>] https://www.kaggle.com/datasets/tueulucan/companies-in-turkey adresinden indirin")
            return 0

        df = pd.read_csv(filepath)
        count = 0
        for _, row in df.iterrows():
            company = {
                "name": clean_company_name(str(row.get("name", row.get("Company", row.get("company_name", ""))))),
                "sector": normalize_sector(str(row.get("sector", row.get("industry", row.get("Sector", ""))))),
                "city": str(row.get("city", row.get("City", row.get("location", "")))),
                "address": str(row.get("address", row.get("Address", ""))),
                "phone": str(row.get("phone", row.get("Phone", ""))),
                "website": str(row.get("website", row.get("Website", row.get("url", "")))),
                "email": str(row.get("email", row.get("Email", ""))),
                "employee_count": str(row.get("employee_count", row.get("employees", row.get("size", "")))),
                "description": str(row.get("description", row.get("about", ""))),
                "source": "kaggle",
                "source_url": "https://www.kaggle.com/datasets/tueulucan/companies-in-turkey",
            }
            company = {k: v for k, v in company.items() if v and v != "nan"}
            if company.get("name"):
                self.db.upsert_company(company)
                count += 1
        self.db.log_scrape("kaggle_companies", filepath, count, "success")
        return count

    def load_top500_industrial(self, filepath):
        """Load Kaggle 'Top 500 Industrial Companies of Turkey' dataset"""
        if not os.path.exists(filepath):
            print(f"  [!] Dosya bulunamadi: {filepath}")
            print(f"  [>] https://www.kaggle.com/datasets/sadikemir/the-top-500-industrial-companies-of-trkiye adresinden indirin")
            return 0

        df = pd.read_csv(filepath)
        count = 0
        for _, row in df.iterrows():
            company = {
                "name": clean_company_name(str(row.get("name", row.get("Company", row.get("Firma", ""))))),
                "sector": normalize_sector(str(row.get("sector", row.get("industry", row.get("Sektor", ""))))),
                "city": str(row.get("city", row.get("City", row.get("Sehir", "")))),
                "website": str(row.get("website", row.get("Website", row.get("url", "")))),
                "employee_count": str(row.get("employee_count", row.get("employees", row.get("Calisan", "")))),
                "description": str(row.get("description", row.get("about", ""))),
                "source": "kaggle_top500",
                "source_url": "https://www.kaggle.com/datasets/sadikemir/the-top-500-industrial-companies-of-trkiye",
            }
            company = {k: v for k, v in company.items() if v and v != "nan"}
            if company.get("name"):
                self.db.upsert_company(company)
                count += 1
        self.db.log_scrape("kaggle_top500", filepath, count, "success")
        return count

    def load_generic_csv(self, filepath, mapping=None):
        """Load any CSV with custom column mapping"""
        if not os.path.exists(filepath):
            print(f"  [!] Dosya bulunamadi: {filepath}")
            return 0

        df = pd.read_csv(filepath)
        if mapping:
            df = df.rename(columns=mapping)

        count = 0
        for _, row in df.iterrows():
            company = {
                "name": clean_company_name(str(row.get("name", ""))),
                "sector": normalize_sector(str(row.get("sector", ""))),
                "city": str(row.get("city", "")),
                "address": str(row.get("address", "")),
                "phone": str(row.get("phone", "")),
                "website": str(row.get("website", "")),
                "email": str(row.get("email", "")),
                "employee_count": str(row.get("employee_count", "")),
                "description": str(row.get("description", "")),
                "source": "csv_import",
                "source_url": filepath,
            }
            company = {k: v for k, v in company.items() if v and v != "nan"}
            if company.get("name"):
                self.db.upsert_company(company)
                count += 1
        self.db.log_scrape("csv_import", filepath, count, "success")
        return count
