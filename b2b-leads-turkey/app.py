import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import streamlit as st
import pandas as pd
from config.settings import DB_PATH, DATA_DIR, OUTPUT_DIR, SECTORS
from src.utils.database import Database
from src.company_finder.website_scraper import WebsiteScraper
from src.contact_finder.rotator import ContactRotator
from src.email_verifier.verifier import EmailVerifier
from src.company_finder.scrapers.all_sources import (
    SCRAPER_REGISTRY, get_all_scrapers, get_scraper,
)


def get_db():
    return Database(DB_PATH)


st.set_page_config(page_title="B2B Leads Turkey", page_icon="🇹🇷", layout="wide")

st.title("🇹🇷 B2B Leads Turkey")
st.caption("Türkiye Odaklı B2B Lead Generation Sistemi | 12 Veri Kaynağı")

tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs(
    ["📊 Dashboard", "🔍 Firma Ara", "🔎 Kaynak Tarama", "📧 Kontak Bul", "✅ Email Doğrula", "📥 İçe/Dışa Aktar", "⚙️ Servisler"]
)

# ─── TAB 1: Dashboard ───
with tab1:
    db = get_db()
    stats = db.get_stats()

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Toplam Firma", stats["companies"])
    col2.metric("Toplam Kontak", stats["contacts"])
    col3.metric("Sektör", stats["sectors"])
    col4.metric("Şehir", stats["cities"])

    # Kaynak dağılımı
    source_dist = db.conn.execute(
        "SELECT source, COUNT(*) as count FROM companies WHERE source IS NOT NULL GROUP BY source ORDER BY count DESC"
    ).fetchall()
    if source_dist:
        st.subheader("Kaynak Dağılımı")
        df_source = pd.DataFrame(source_dist, columns=["Kaynak", "Firma Sayısı"])
        st.bar_chart(df_source, x="Kaynak", y="Firma Sayısı", use_container_width=True)

    col_left, col_right = st.columns(2)
    with col_left:
        st.subheader("Sektör Dağılımı")
        if stats["sector_distribution"]:
            df_sector = pd.DataFrame(stats["sector_distribution"])
            st.bar_chart(df_sector, x="sector", y="count", use_container_width=True)

    with col_right:
        st.subheader("Şehir Dağılımı")
        if stats["city_distribution"]:
            df_city = pd.DataFrame(stats["city_distribution"])
            st.bar_chart(df_city, x="city", y="count", use_container_width=True)

    st.subheader("Tüm Firmalar")
    companies = db.get_companies(limit=9999)
    if companies:
        df = pd.DataFrame(companies)
        display_cols = ["id", "name", "sector", "city", "email", "phone", "website", "employee_count", "source"]
        available = [c for c in display_cols if c in df.columns]
        st.dataframe(df[available], use_container_width=True, hide_index=True)
    else:
        st.info("Henüz firma yok. 'Firma Ara' veya 'Kaynak Tarama' sekmesinden başlayın.")
    db.close()

# ─── TAB 2: Firma Ara (Tüm Kaynaklar) ───
with tab2:
    st.subheader("🚀 Sektöre Göre Tüm Kaynaklarda Ara")
    st.info("12 veri kaynağında aynı anda arama yapar")

    col1, col2 = st.columns(2)
    with col1:
        sector_options = list(SECTORS.keys())
        selected_sector = st.selectbox("Sektör Seçin", sector_options, index=0, key="tab2_sector")
    with col2:
        city_filter = st.text_input("Şehir (opsiyonel)", key="tab2_city")

    if st.button("🔍 Tüm Kaynaklarda Ara", key="search_all_btn"):
        db = get_db()
        sector_name = selected_sector.title()
        scrapers = get_all_scrapers(db)
        total = 0

        progress = st.progress(0, text="Taranıyor...")
        for i, (key, scraper) in enumerate(scrapers.items()):
            progress.progress((i + 1) / len(scrapers), text=f"[{i+1}/12] {scraper.description}")
            try:
                count = scraper.search(sector=sector_name, city=city_filter or None, query=sector_name)
                total += count
            except Exception:
                pass

        progress.empty()

        st.info("Website'lar zenginleştiriliyor...")
        try:
            ws = WebsiteScraper(db)
            enriched = ws.batch_enrich(limit=50)
            st.success(f"{enriched} firma zenginleştirildi")
        except Exception as e:
            st.error(f"Website scraping hatası: {e}")

        st.success(f"Toplam {total} firma eklendi!")
        db.close()
        st.rerun()

# ─── TAB 3: Kaynak Tarama (Tek Kaynak) ───
with tab3:
    st.subheader("🔎 Tek Kaynak Tarama")

    source_names = list(SCRAPER_REGISTRY.keys())
    source_descriptions = [SCRAPER_REGISTRY[k].description + f" ({SCRAPER_REGISTRY[k].source_url})" for k in source_names]

    col1, col2 = st.columns(2)
    with col1:
        selected_source = st.selectbox("Veri Kaynağı", source_names, format_func=lambda x: f"{x} - {SCRAPER_REGISTRY[x].description}", key="tab3_source")
    with col2:
        sector_query = st.text_input("Sektör / Sorgu", key="tab3_query")
        city_query = st.text_input("Şehir", key="tab3_city")

    # Kaynak detay
    scraper_cls = SCRAPER_REGISTRY[selected_source]
    with st.expander(f"ℹ️ {scraper_cls.description}"):
        st.markdown(f"**URL:** {scraper_cls.source_url}")
        st.markdown(f"**Tip:** {scraper_cls.source_type}")

    if st.button("🔎 Taramayı Başlat", key="source_search_btn"):
        db = get_db()
        scraper = get_scraper(selected_source, db)
        with st.spinner(f"{scraper.description} taranıyor..."):
            try:
                count = scraper.search(
                    sector=sector_query or None,
                    city=city_query or None,
                    query=sector_query or None,
                )
                st.success(f"{count} firma bulundu!")
            except Exception as e:
                st.error(f"Hata: {e}")
        db.close()
        st.rerun()

    st.divider()

    # Website zenginleştirme
    st.subheader("🌐 Website Zenginleştirme")
    enrich_limit = st.slider("Limit", 5, 100, 20, key="tab3_enrich")
    if st.button("Website'ları Zenginleştir", key="enrich_btn_tab3"):
        db = get_db()
        with st.spinner(f"{enrich_limit} firma zenginleştiriliyor..."):
            ws = WebsiteScraper(db)
            count = ws.batch_enrich(limit=enrich_limit)
        st.success(f"{count} firma zenginleştirildi!")
        db.close()
        st.rerun()

# ─── TAB 4: Kontak Bul ───
with tab4:
    st.subheader("📧 API Servisleri ile Kontak Bul")
    st.warning("Bu özellik API key gerektirir. `.env` dosyasını ayarlayın.")

    db = get_db()
    try:
        rotator = ContactRotator(db)
        active_services = rotator.get_active_services()
        if active_services:
            st.info(f"Aktif servisler: {', '.join(s[1].name for s in active_services)}")
        else:
            st.warning("Hiçbir API servisi aktif değil.")
    except Exception:
        active_services = []

    contact_limit = st.slider("Limit", 5, 100, 20, key="contact_limit")

    if st.button("📧 Kontakları Bul", key="contact_btn"):
        if not active_services:
            st.error("Aktif servis yok! .env dosyasına API key ekleyin.")
        else:
            with st.spinner("Kontaklar aranıyor..."):
                try:
                    total_contacts, total_companies = rotator.batch_find_contacts(limit=contact_limit)
                    st.success(f"{total_contacts} kontak, {total_companies} şirkette bulundu!")
                except Exception as e:
                    st.error(f"Hata: {e}")
            st.rerun()

    st.divider()
    st.subheader("Mevcut Kontaklar")
    contacts = db.get_contacts(limit=9999)
    if contacts:
        df_contacts = pd.DataFrame(contacts)
        display_cols = ["full_name", "email", "phone", "position", "company_name", "sector", "source", "confidence"]
        available = [c for c in display_cols if c in df_contacts.columns]
        st.dataframe(df_contacts[available], use_container_width=True, hide_index=True)
    else:
        st.info("Henüz kontak bulunamadı.")
    db.close()

# ─── TAB 5: Email Doğrula ───
with tab5:
    st.subheader("✅ Email Doğrulama")
    db = get_db()
    contacts = db.get_contacts(limit=9999)
    emails_to_verify = [c["email"] for c in contacts if c.get("email")]

    if emails_to_verify:
        st.info(f"{len(emails_to_verify)} email doğrulanacak")
        if st.button("✅ Doğrula", key="verify_btn"):
            verifier = EmailVerifier()
            results = []
            with st.spinner("Email'ler doğrulanıyor..."):
                for email in emails_to_verify:
                    result = verifier.verify_email(email)
                    results.append(result)
            df_verify = pd.DataFrame(results)
            st.dataframe(df_verify, use_container_width=True, hide_index=True)
    else:
        st.info("Doğrulanacak email yok. Önce kontak bulun.")
    db.close()

# ─── TAB 6: İçe/Dışa Aktar ───
with tab6:
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("📥 CSV İçe Aktar")
        uploaded = st.file_uploader("CSV Dosyası Yükle", type=["csv"])
        if uploaded and st.button("Yükle", key="import_btn"):
            db = get_db()
            from src.company_finder.kaggle_loader import KaggleLoader
            loader = KaggleLoader(db)
            filepath = os.path.join(DATA_DIR, uploaded.name)
            with open(filepath, "wb") as f:
                f.write(uploaded.getvalue())
            count = loader.load_generic_csv(filepath)
            st.success(f"{count} firma yüklendi!")
            db.close()
            st.rerun()

    with col2:
        st.subheader("📤 Dışa Aktar")
        export_type = st.selectbox("Tip", ["all", "companies", "contacts"])
        export_sector = st.text_input("Sektör Filtresi (opsiyonel)")

        if st.button("İndir", key="export_btn"):
            db = get_db()
            os.makedirs(OUTPUT_DIR, exist_ok=True)
            files = []
            if export_type in ("companies", "all"):
                path = os.path.join(OUTPUT_DIR, "firmalar.csv")
                count = db.export_companies_csv(path, sector=export_sector or None)
                files.append(path)
                st.success(f"{count} firma → firmalar.csv")
            if export_type in ("contacts", "all"):
                path = os.path.join(OUTPUT_DIR, "kontaklar.csv")
                count = db.export_contacts_csv(path)
                files.append(path)
                st.success(f"{count} kontak → kontaklar.csv")
            for f in files:
                with open(f, "rb") as file:
                    st.download_button(label=f"💾 {os.path.basename(f)} İndir", data=file.read(), file_name=os.path.basename(f), mime="text/csv")
            db.close()

# ─── TAB 7: Servisler ───
with tab7:
    st.subheader("⚙️ Veri Kaynakları")
    st.caption(f"Toplam {len(SCRAPER_REGISTRY)} veri kaynağı mevcut")

    sources_info = []
    for key, cls in SCRAPER_REGISTRY.items():
        sources_info.append({"Kaynak": key, "Açıklama": cls.description, "URL": cls.source_url, "Tip": cls.source_type})
    st.dataframe(pd.DataFrame(sources_info), use_container_width=True, hide_index=True)

    st.divider()
    st.subheader("⚙️ API Servis Durumları")
    db = get_db()
    limits = db.get_service_limits()
    if limits:
        st.dataframe(pd.DataFrame(limits), use_container_width=True, hide_index=True)
    else:
        st.info("Servis limit kaydı yok.")

    st.code("""
# .env dosyası oluşturun:
cp .env.example .env

# API Keyleri ekleyin:
HUNTER_API_KEY=xxx       # https://hunter.io (25/ay ücretsiz)
SNOV_API_CLIENT_ID=xxx   # https://snov.io (50 kredi/ay)
SNOV_API_CLIENT_SECRET=xxx
APOLLO_API_KEY=xxx        # https://apollo.io
CLEARBIT_API_KEY=xxx      # https://clearbit.com
ROCKETREACH_API_KEY=xxx   # https://rocketreach.co
ABSTRACT_API_KEY=xxx      # https://abstractapi.com (100/ay)
    """, language="bash")

    st.divider()
    st.subheader("📜 Scrape Logları")
    logs = db.conn.execute("SELECT * FROM scrape_log ORDER BY id DESC LIMIT 20").fetchall()
    if logs:
        st.dataframe(pd.DataFrame([dict(l) for l in logs]), use_container_width=True, hide_index=True)
    else:
        st.info("Log yok.")
    db.close()
