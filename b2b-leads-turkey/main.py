#!/usr/bin/env python3
"""
B2B Leads Turkey - Türkiye Odaklı B2B Lead Generation Sistemi

Kullanım:
  python main.py search <sektor>              - Sektöre göre tüm kaynaklarda firma ara
  python main.py search-source <kaynak> [sektör] - Belirli bir kaynaktan ara
  python main.py contacts [--limit N]         - Firmalar için kontak bul
  python main.py enrich [--limit N]           - Firma website'larını zenginleştir
  python main.py verify                       - Email'leri doğrula
  python main.py status                       - Servis durumlarını göster
  python main.py stats                        - Veritabanı istatistikleri
  python main.py export [--sektor X]          - CSV olarak dışa aktar
  python main.py import-csv <dosya>           - CSV içe aktar
  python main.py full-run <sektor>            - Tam pipeline çalıştır
  python main.py list-sources                 - Tüm veri kaynaklarını listele
  python main.py list-sectors                 - Sektörleri listele
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

from config.settings import DB_PATH, DATA_DIR, OUTPUT_DIR, SECTORS
from src.utils.database import Database
from src.company_finder.kaggle_loader import KaggleLoader
from src.company_finder.website_scraper import WebsiteScraper
from src.contact_finder.rotator import ContactRotator
from src.email_verifier.verifier import EmailVerifier
from src.company_finder.scrapers.all_sources import (
    SCRAPER_REGISTRY, get_all_scrapers, get_scraper,
)

console = Console()


def get_db():
    return Database(DB_PATH)


def resolve_sector(sector):
    for key, val in SECTORS.items():
        if key == sector.lower() or val == sector.lower():
            return key.title()
    return sector.title()


@click.group()
def cli():
    """B2B Leads Turkey - Türkiye Odaklı B2B Lead Generation Sistemi"""
    pass


# ─── LIST SOURCES ───
@cli.command("list-sources")
def list_sources():
    """Tüm veri kaynaklarını listele"""
    table = Table(title="📊 Veri Kaynakları (12 Kaynak)")
    table.add_column("#", style="white")
    table.add_column("Kaynak", style="cyan")
    table.add_column("Açıklama", style="green")
    table.add_column("Tip", style="yellow")
    table.add_column("URL", style="blue")

    for i, (key, cls) in enumerate(SCRAPER_REGISTRY.items(), 1):
        table.add_row(str(i), key, cls.description, cls.source_type, cls.source_url)

    console.print(table)
    console.print(f"\n[cyan]Kullanım: python main.py search-source <kaynak_adi>[/cyan]")


# ─── LIST SECTORS ───
@cli.command("list-sectors")
def list_sectors():
    """Kullanılabilir sektörleri listele"""
    table = Table(title="Sektörler")
    table.add_column("#", style="white")
    table.add_column("Sektör (TR)", style="cyan")
    table.add_column("Sektör (EN)", style="green")
    for i, (key, val) in enumerate(SECTORS.items(), 1):
        table.add_row(str(i), key, val)
    console.print(table)


# ─── SEARCH (TÜM KAYNAKLAR) ───
@cli.command()
@click.argument("sector")
@click.option("--city", default=None, help="Şehir filtresi")
@click.option("--limit", default=50, help="Website zenginleştirme limiti")
def search(sector, city, limit):
    """Sektöre göre TÜM kaynaklarda firma ara"""
    db = get_db()
    sector_name = resolve_sector(sector)

    console.print(Panel(
        f"[bold green]Sektör: {sector_name} | Şehir: {city or 'Tümü'}\n"
        f"12 veri kaynağı taranacak[/bold green]",
        style="green",
    ))

    total = 0
    scrapers = get_all_scrapers(db)

    for i, (key, scraper) in enumerate(scrapers.items(), 1):
        console.print(f"\n[bold cyan]{i}/12. {scraper.description}[/bold cyan]")
        try:
            count = scraper.search(sector=sector_name, city=city, query=sector_name)
            console.print(f"  [green]+{count} firma ({key})[/green]")
            total += count
        except Exception as e:
            console.print(f"  [red]Hata: {e}[/red]")

    console.print(f"\n[bold green]Toplam: {total} firma eklendi[/bold green]")
    db.close()


# ─── SEARCH-SOURCE (TEK KAYNAK) ───
@cli.command("search-source")
@click.argument("source_name")
@click.argument("sector", required=False, default=None)
@click.option("--city", default=None, help="Şehir filtresi")
@click.option("--query", default=None, help="Arama sorgusu")
@click.option("--institution-type", default=None, help="Kurum tipi (BDDK, SPK, EPDK için)")
def search_source(source_name, sector, city, query, institution_type):
    """Belirli bir veri kaynağında ara"""
    db = get_db()

    scraper = get_scraper(source_name, db)
    if not scraper:
        console.print(f"[red]Kaynak bulunamadı: {source_name}[/red]")
        console.print(f"[cyan]Mevcut kaynaklar: {', '.join(SCRAPER_REGISTRY.keys())}[/cyan]")
        db.close()
        return

    sector_name = resolve_sector(sector) if sector else None
    console.print(Panel(
        f"[bold green]Kaynak: {scraper.description}[/bold green]\n"
        f"Sektör: {sector_name or '-'} | Şehir: {city or '-'} | Sorgu: {query or '-'}",
        style="green",
    ))

    try:
        count = scraper.search(
            sector=sector_name, city=city, query=query or sector_name,
            institution_type=institution_type,
        )
        console.print(f"[green]+{count} firma bulundu[/green]")
    except Exception as e:
        console.print(f"[red]Hata: {e}[/red]")

    db.close()


# ─── CONTACTS ───
@cli.command()
@click.option("--limit", default=50, help="Maksimum şirket sayısı")
@click.option("--website/--no-website", default=True, help="Website scraping yap")
def contacts(limit, website):
    """Firmalar için kontak (email/telefon) bul"""
    db = get_db()
    console.print(Panel(f"[bold green]Kontak Arama - Limit: {limit}[/bold green]", style="green"))

    if website:
        console.print("\n[bold]1. Website Scraping ile Kontak Bulma[/bold]")
        try:
            ws = WebsiteScraper(db)
            count = ws.batch_enrich(limit=limit)
            console.print(f"  [green]+{count} firma zenginleştirildi[/green]")
        except Exception as e:
            console.print(f"  [red]Hata: {e}[/red]")

    console.print("\n[bold]2. API Servisleri ile Kontak Bulma[/bold]")
    try:
        rotator = ContactRotator(db)
        console.print("\n[bold]Aktif Servisler:[/bold]")
        rotator.check_service_status()
        total_contacts, total_companies = rotator.batch_find_contacts(limit=limit)
        console.print(f"\n  [green]{total_contacts} kontak, {total_companies} şirkette bulundu[/green]")
    except Exception as e:
        console.print(f"  [red]Hata: {e}[/red]")

    db.close()


# ─── ENRICH ───
@cli.command()
@click.option("--limit", default=50, help="Maksimum şirket sayısı")
def enrich(limit):
    """Firma website'larını zenginleştir (ekip, iletişim bilgisi)"""
    db = get_db()
    console.print(Panel(f"[bold green]Website Zenginleştirme - Limit: {limit}[/bold green]", style="green"))
    ws = WebsiteScraper(db)
    count = ws.batch_enrich(limit=limit)
    console.print(f"[green]{count} firma zenginleştirildi[/green]")
    db.close()


# ─── VERIFY ───
@cli.command()
@click.option("--limit", default=100, help="Maksimum email sayısı")
def verify(limit):
    """Veritabanındaki email'leri doğrula"""
    db = get_db()
    console.print(Panel("[bold green]Email Doğrulama[/bold green]", style="green"))
    contacts = db.get_contacts(limit=limit)
    verifier = EmailVerifier()
    verified = 0
    for contact in contacts:
        email = contact.get("email", "")
        if not email:
            continue
        result = verifier.verify_email(email)
        if result:
            db.conn.execute("UPDATE contacts SET verified = ? WHERE id = ?", (1 if result.get("dns_valid") or result.get("smtp_valid") else 0, contact["id"]))
            db.conn.commit()
            status = "✓" if result.get("dns_valid") else "✗"
            console.print(f"  {status} {email} ({result.get('service', '')})")
            verified += 1
    console.print(f"\n[green]{verified} email doğrulandı[/green]")
    db.close()


# ─── STATUS ───
@cli.command()
def status():
    """Servis durumlarını ve limitleri göster"""
    db = get_db()
    console.print(Panel("[bold green]Servis Durumları[/bold green]", style="green"))

    table = Table(title="API Servisleri")
    table.add_column("Servis", style="cyan")
    table.add_column("Durum", style="green")
    table.add_column("Kalan İstek", style="yellow")
    table.add_column("Reset Tarihi", style="white")

    limits = db.get_service_limits()
    for limit_row in limits:
        table.add_row(
            limit_row.get("service_name", ""),
            "Aktif" if limit_row.get("remaining", 0) > 0 else "Limit Doldu",
            str(limit_row.get("remaining", 0)),
            limit_row.get("reset_date", "-"),
        )
    if not limits:
        table.add_row("-", "API Key yok", "-", "-")
    console.print(table)

    try:
        rotator = ContactRotator(db)
        console.print("\n[bold]Canlı Durum:[/bold]")
        rotator.check_service_status()
    except Exception:
        pass
    db.close()


# ─── STATS ───
@cli.command()
def stats():
    """Veritabanı istatistikleri"""
    db = get_db()
    s = db.get_stats()

    console.print(Panel("[bold green]Veritabanı İstatistikleri[/bold green]", style="green"))

    table = Table(title="Genel Bilgiler")
    table.add_column("Metrik", style="cyan")
    table.add_column("Değer", style="green")
    table.add_row("Toplam Firma", str(s["companies"]))
    table.add_row("Toplam Kontak", str(s["contacts"]))
    table.add_row("Sektör Sayısı", str(s["sectors"]))
    table.add_row("Şehir Sayısı", str(s["cities"]))
    console.print(table)

    source_dist = db.conn.execute("SELECT source, COUNT(*) as count FROM companies WHERE source IS NOT NULL GROUP BY source ORDER BY count DESC").fetchall()
    if source_dist:
        table = Table(title="Kaynak Dağılımı")
        table.add_column("Kaynak", style="cyan")
        table.add_column("Firma Sayısı", style="green")
        for row in source_dist:
            table.add_row(str(row[0]), str(row[1]))
        console.print(table)

    if s["sector_distribution"]:
        table = Table(title="Sektör Dağılımı")
        table.add_column("Sektör", style="cyan")
        table.add_column("Firma Sayısı", style="green")
        for item in s["sector_distribution"][:15]:
            table.add_row(item["sector"], str(item["count"]))
        console.print(table)

    if s["city_distribution"]:
        table = Table(title="Şehir Dağılımı")
        table.add_column("Şehir", style="cyan")
        table.add_column("Firma Sayısı", style="green")
        for item in s["city_distribution"][:15]:
            table.add_row(item["city"], str(item["count"]))
        console.print(table)

    db.close()


# ─── EXPORT ───
@cli.command()
@click.option("--type", "export_type", type=click.Choice(["companies", "contacts", "all"]), default="all")
@click.option("--sector", default=None, help="Sektör filtresi")
@click.option("--city", default=None, help="Şehir filtresi")
@click.option("--source", default=None, help="Kaynak filtresi")
@click.option("--output-dir", default=None)
def export(export_type, sector, city, source, output_dir):
    """Verileri CSV olarak dışa aktar"""
    db = get_db()
    out_dir = output_dir or OUTPUT_DIR
    os.makedirs(out_dir, exist_ok=True)

    if export_type in ("companies", "all"):
        filepath = os.path.join(out_dir, "firmalar.csv")
        count = db.export_companies_csv(filepath, sector=sector, city=city)
        console.print(f"[green]{count} firma '{filepath}' dosyasına yazıldı[/green]")

    if export_type in ("contacts", "all"):
        filepath = os.path.join(out_dir, "kontaklar.csv")
        count = db.export_contacts_csv(filepath)
        console.print(f"[green]{count} kontak '{filepath}' dosyasına yazıldı[/green]")

    db.close()


# ─── IMPORT-CSV ───
@cli.command("import-csv")
@click.argument("filepath")
@click.option("--mapping", default=None, help="Kolon eşleştirmesi JSON formatında")
def import_csv(filepath, mapping):
    """CSV dosyasından firma verisi içe aktar"""
    db = get_db()
    loader = KaggleLoader(db)
    col_mapping = None
    if mapping:
        import json
        col_mapping = json.loads(mapping)
    count = loader.load_generic_csv(filepath, mapping=col_mapping)
    console.print(f"[green]{count} firma içe aktarıldı[/green]")
    db.close()


# ─── FULL-RUN ───
@cli.command("full-run")
@click.argument("sector")
@click.option("--limit", default=50, help="Kontak bulma limiti")
@click.option("--city", default=None, help="Şehir filtresi")
def full_run(sector, limit, city):
    """Tam pipeline: Tüm kaynaklarda ara → Zenginleştir → Kontak bul → Doğrula → Dışa aktar"""
    db = get_db()
    sector_name = resolve_sector(sector)

    console.print(Panel(
        f"[bold green]FULL RUN - Sektör: {sector_name} | Şehir: {city or 'Tümü'}[/bold green]\n"
        f"1. 12 Kaynakta Ara → 2. Zenginleştir → 3. Kontak Bul → 4. Doğrula → 5. Dışa Aktar",
        style="green",
    ))

    # ADIM 1: Tüm kaynaklarda ara
    console.print(f"\n[bold cyan]═══ ADIM 1: Tüm Kaynaklarda Firma Arama (12 Kaynak) ═══[/bold cyan]")
    total_companies = 0
    scrapers = get_all_scrapers(db)

    for i, (key, scraper) in enumerate(scrapers.items(), 1):
        console.print(f"  [{i}/12] {scraper.description}...")
        try:
            count = scraper.search(sector=sector_name, city=city, query=sector_name)
            console.print(f"    [green]+{count} firma[/green]")
            total_companies += count
        except Exception as e:
            console.print(f"    [red]Hata: {e}[/red]")

    # ADIM 2: Website zenginleştirme
    console.print(f"\n[bold cyan]═══ ADIM 2: Website Zenginleştirme ═══[/bold cyan]")
    try:
        ws = WebsiteScraper(db)
        count = ws.batch_enrich(limit=limit)
        console.print(f"  [green]{count} firma zenginleştirildi[/green]")
    except Exception as e:
        console.print(f"  [red]Hata: {e}[/red]")

    # ADIM 3: Kontak bulma
    console.print(f"\n[bold cyan]═══ ADIM 3: API Servisleri ile Kontak Bulma ═══[/bold cyan]")
    total_contacts = 0
    try:
        rotator = ContactRotator(db)
        rotator.check_service_status()
        tc, tco = rotator.batch_find_contacts(limit=limit)
        total_contacts = tc
        console.print(f"  [green]{tc} kontak bulundu[/green]")
    except Exception as e:
        console.print(f"  [red]Hata: {e}[/red]")

    # ADIM 4: Email doğrulama
    console.print(f"\n[bold cyan]═══ ADIM 4: Email Doğrulama ═══[/bold cyan]")
    try:
        contacts = db.get_contacts(limit=9999)
        verifier = EmailVerifier()
        verified = 0
        for contact in contacts:
            email = contact.get("email", "")
            if not email:
                continue
            result = verifier.verify_email(email)
            if result:
                db.conn.execute("UPDATE contacts SET verified = ? WHERE id = ?", (1 if result.get("dns_valid") else 0, contact["id"]))
                db.conn.commit()
                verified += 1
        console.print(f"  [green]{verified} email doğrulandı[/green]")
    except Exception as e:
        console.print(f"  [red]Hata: {e}[/red]")

    # ADIM 5: Dışa aktarma
    console.print(f"\n[bold cyan]═══ ADIM 5: Dışa Aktarma ═══[/bold cyan]")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    comp_path = os.path.join(OUTPUT_DIR, f"firmalar_{sector}.csv")
    cont_path = os.path.join(OUTPUT_DIR, f"kontaklar_{sector}.csv")
    db.export_companies_csv(comp_path, sector=sector_name)
    db.export_contacts_csv(cont_path)
    console.print(f"  [green]Firmalar: {comp_path}[/green]")
    console.print(f"  [green]Kontaklar: {cont_path}[/green]")

    s = db.get_stats()
    console.print(Panel(
        f"[bold green]TAMAMLANDI[/bold green]\n\n"
        f"Toplam Firma: {s['companies']}\n"
        f"Toplam Kontak: {s['contacts']}\n"
        f"Bu Çalışmada: {total_companies} firma, {total_contacts} kontak",
        style="green",
    ))
    db.close()


if __name__ == "__main__":
    cli()
