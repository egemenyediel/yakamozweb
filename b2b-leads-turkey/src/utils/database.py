import sqlite3
import json
import os
from datetime import datetime


class Database:
    def __init__(self, db_path):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self._create_tables()

    def _create_tables(self):
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS companies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                sector TEXT,
                sector_en TEXT,
                city TEXT,
                address TEXT,
                phone TEXT,
                website TEXT,
                email TEXT,
                tax_number TEXT,
                registry_number TEXT,
                employee_count TEXT,
                founded_year TEXT,
                description TEXT,
                source TEXT,
                source_url TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(name, city)
            );

            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_id INTEGER,
                first_name TEXT,
                last_name TEXT,
                full_name TEXT,
                email TEXT,
                phone TEXT,
                position TEXT,
                department TEXT,
                linkedin TEXT,
                confidence TEXT,
                source TEXT,
                verified INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id),
                UNIQUE(email, company_id)
            );

            CREATE TABLE IF NOT EXISTS service_limits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_name TEXT NOT NULL,
                limit_type TEXT,
                remaining INTEGER DEFAULT 0,
                total INTEGER DEFAULT 0,
                reset_date TEXT,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(service_name, limit_type)
            );

            CREATE TABLE IF NOT EXISTS scrape_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scraper_type TEXT,
                query TEXT,
                results_count INTEGER DEFAULT 0,
                status TEXT,
                error TEXT,
                started_at TEXT,
                completed_at TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
            CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city);
            CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
            CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
        """)
        self.conn.commit()

    def upsert_company(self, company: dict) -> int:
        existing = self.conn.execute(
            "SELECT id FROM companies WHERE name = ? AND city = ?",
            (company.get("name"), company.get("city", "")),
        ).fetchone()

        if existing:
            company_id = existing["id"]
            sets = ", ".join(f"{k} = ?" for k in company.keys() if k != "id")
            vals = [company[k] for k in company.keys() if k != "id"]
            vals.append(datetime.now().isoformat())
            self.conn.execute(
                f"UPDATE companies SET {sets}, updated_at = ? WHERE id = ?",
                (*vals, company_id),
            )
            self.conn.commit()
            return company_id

        company["created_at"] = datetime.now().isoformat()
        cols = ", ".join(company.keys())
        placeholders = ", ".join(["?"] * len(company))
        cursor = self.conn.execute(
            f"INSERT INTO companies ({cols}) VALUES ({placeholders})",
            list(company.values()),
        )
        self.conn.commit()
        return cursor.lastrowid

    def upsert_contact(self, contact: dict) -> int:
        email = contact.get("email", "")
        company_id = contact.get("company_id")

        if not email and not company_id:
            return 0

        existing = self.conn.execute(
            "SELECT id FROM contacts WHERE email = ? AND company_id = ?",
            (email, company_id),
        ).fetchone()

        if existing:
            contact_id = existing["id"]
            sets = ", ".join(f"{k} = ?" for k in contact.keys() if k not in ("id",))
            vals = [contact[k] for k in contact.keys() if k not in ("id",)]
            self.conn.execute(
                f"UPDATE contacts SET {sets} WHERE id = ?",
                (*vals, contact_id),
            )
            self.conn.commit()
            return contact_id

        cursor = self.conn.execute(
            "INSERT INTO contacts (company_id, first_name, last_name, full_name, email, phone, position, department, linkedin, confidence, source, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                contact.get("company_id"),
                contact.get("first_name", ""),
                contact.get("last_name", ""),
                contact.get("full_name", ""),
                email,
                contact.get("phone", ""),
                contact.get("position", ""),
                contact.get("department", ""),
                contact.get("linkedin", ""),
                contact.get("confidence", ""),
                contact.get("source", ""),
                0,
            ),
        )
        self.conn.commit()
        return cursor.lastrowid

    def get_companies(self, sector=None, city=None, limit=100, offset=0):
        query = "SELECT * FROM companies WHERE 1=1"
        params = []
        if sector:
            query += " AND sector = ?"
            params.append(sector)
        if city:
            query += " AND city = ?"
            params.append(city)
        query += " ORDER BY id DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        return [dict(row) for row in self.conn.execute(query, params).fetchall()]

    def get_contacts(self, company_id=None, limit=100, offset=0):
        query = "SELECT c.*, co.name as company_name, co.sector FROM contacts c LEFT JOIN companies co ON c.company_id = co.id WHERE 1=1"
        params = []
        if company_id:
            query += " AND c.company_id = ?"
            params.append(company_id)
        query += " ORDER BY c.id DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        return [dict(row) for row in self.conn.execute(query, params).fetchall()]

    def get_companies_without_contacts(self, limit=50):
        rows = self.conn.execute(
            "SELECT * FROM companies c WHERE NOT EXISTS (SELECT 1 FROM contacts ct WHERE ct.company_id = c.id) AND c.website IS NOT NULL AND c.website != '' LIMIT ?",
            (limit,),
        ).fetchall()
        return [dict(row) for row in rows]

    def update_service_limit(self, service_name, limit_type, remaining, total=0, reset_date=None):
        self.conn.execute(
            "INSERT INTO service_limits (service_name, limit_type, remaining, total, reset_date, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(service_name, limit_type) DO UPDATE SET remaining = ?, total = ?, reset_date = ?, updated_at = ?",
            (service_name, limit_type, remaining, total, reset_date, datetime.now().isoformat(), remaining, total, reset_date, datetime.now().isoformat()),
        )
        self.conn.commit()

    def get_service_limits(self):
        rows = self.conn.execute("SELECT * FROM service_limits ORDER BY service_name").fetchall()
        return [dict(row) for row in rows]

    def log_scrape(self, scraper_type, query, results_count, status, error=None, started_at=None):
        self.conn.execute(
            "INSERT INTO scrape_log (scraper_type, query, results_count, status, error, started_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (scraper_type, query, results_count, status, error, started_at, datetime.now().isoformat()),
        )
        self.conn.commit()

    def get_stats(self):
        company_count = self.conn.execute("SELECT COUNT(*) FROM companies").fetchone()[0]
        contact_count = self.conn.execute("SELECT COUNT(*) FROM contacts").fetchone()[0]
        sector_count = self.conn.execute("SELECT COUNT(DISTINCT sector) FROM companies WHERE sector IS NOT NULL").fetchone()[0]
        city_count = self.conn.execute("SELECT COUNT(DISTINCT city) FROM companies WHERE city IS NOT NULL").fetchone()[0]
        sectors = [dict(row) for row in self.conn.execute("SELECT sector, COUNT(*) as count FROM companies WHERE sector IS NOT NULL GROUP BY sector ORDER BY count DESC").fetchall()]
        cities = [dict(row) for row in self.conn.execute("SELECT city, COUNT(*) as count FROM companies WHERE city IS NOT NULL GROUP BY city ORDER BY count DESC LIMIT 20").fetchall()]
        return {
            "companies": company_count,
            "contacts": contact_count,
            "sectors": sector_count,
            "cities": city_count,
            "sector_distribution": sectors,
            "city_distribution": cities,
        }

    def export_companies_csv(self, filepath, sector=None, city=None):
        import csv
        companies = self.get_companies(sector=sector, city=city, limit=999999)
        if not companies:
            return 0
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=companies[0].keys())
            writer.writeheader()
            writer.writerows(companies)
        return len(companies)

    def export_contacts_csv(self, filepath, company_id=None):
        import csv
        contacts = self.get_contacts(company_id=company_id, limit=999999)
        if not contacts:
            return 0
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=contacts[0].keys())
            writer.writeheader()
            writer.writerows(contacts)
        return len(contacts)

    def close(self):
        self.conn.close()
