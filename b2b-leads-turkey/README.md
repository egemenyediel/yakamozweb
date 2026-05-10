# B2B Leads Turkey 🇹🇷

Türkiye odaklı, açık kaynak B2B lead generation sistemi. Sektör bazlı firma bulma, çalışan tespiti, email/telefon çıkarma ve doğrulama.

## Özellikler

- **Çoklu Veri Kaynağı**: Google Maps, TOBB Ticaret Sicil Gazetesi, Kaggle dataset'leri, CSV import
- **Website Scraping**: Firma sitelerinden ekip, iletişim, email çıkarma (Scrapling ile)
- **Servis Rotasyonu**: Hunter.io → Snov.io → Apollo.io → Clearbit → RocketReach (biri limitini doldurunda sıradakine geçer)
- **Email Doğrulama**: Syntax, DNS, SMTP doğrulama (Disify + Abstract API)
- **SQLite Veritabanı**: Tüm veriler lokal, dışa aktarma CSV
- **Tam Pipeline**: Tek komutla ara → zenginleştir → kontak bul → doğrula → dışa aktar

## Kurulum

```bash
cd b2b-leads-tur
```

### API Keyleri (Opsiyonel ama önerilen)

```bash
cp .env.example .env
# .env dosyasını düzenleyerek API keyleri ekleyin
```

| Servis | Ücretsiz Limit | Kayıt |
|--------|----------------|-------|
| Hunter.io | 25 arama/ay | https://hunter.io |
| Snov.io | 50 kredi/ay | https://snov.io |
| Apollo.io | Sınırlı ücretsiz | https://apollo.io |
| Clearbit | Ücretsiz katman | https://clearbit.com |
| RocketReach | Sınırlı ücretsiz | https://rocketreach.co |
| Abstract API | 100 doğrulama/ay | https://abstractapi.com |

## Kullanım

### Sektörleri Listele
```bash
python main.py list-sectors
```

### Sektöre Göre Firma Ara
```bash
python main.py search teknoloji
python main.py search finans --source google
python main.py search otomotiv --max-pages 5
```

### Firmalar İçin Kontak Bul
```bash
python main.py contacts --limit 50
python main.py contacts --no-website --limit 100
```

### Website Zenginleştirme
```bash
python main.py enrich --limit 30
```

### Email Doğrulama
```bash
python main.py verify --limit 200
```

### Verileri Dışa Aktar
```bash
python main.py export --type all
python main.py export --type companies --sector Teknoloji
```

### CSV İçe Aktar
```bash
python main.py import-csv data/firmalar.csv
# Kolon eşleştirmesi ile:
python main.py import-csv data/firmalar.csv --mapping '{"Firma':'name","Sehir":"city"}'
```

### Tam Pipeline (Tek Komut)
```bash
python main.py full-run teknoloji --limit 50
python main.py full-run savunma_sanayi --limit 30 --max-pages 3
```

### Servis Durumları
```bash
python main.py status
```

### İstatistikler
```bash
python main.py stats
```

## Mimari

```
b2b-leads-turkey/
├── config/
│   ├── settings.py          # Ayarlar ve sabitler
│   └── services.py          # API servis implementasyonları
├── src/
│   ├── company_finder/
│   │   ├── kaggle_loader.py      # Kaggle CSV yükleme
│   │   ├── google_maps_scraper.py # Google Maps tarama
│   │   ├── tob_scraper.py        # TOBB Gazete tarama
│   │   └── website_scraper.py    # Website scraping (ekip/iletişim)
│   ├── contact_finder/
│   │   └── rotator.py       # Servis rotasyonu (Hunter→Snov→Apollo→...)
│   ├── email_verifier/
│   │   └── verifier.py      # Email doğrulama
│   └── utils/
│       ├── database.py      # SQLite veritabanı
│       └── helpers.py       # Yardımcı fonksiyonlar
├── data/                    # Veritabanı ve input dosyaları
├── output/                  # CSV çıktılar
├── main.py                  # CLI giriş noktası
└── requirements.txt
```

## Servis Rotasyonu Mantığı

```
Hunter.io (25/ay) → limit doldu → Snov.io (50/ay) → limit doldu →
Apollo.io → limit doldu → Clearbit → limit doldu → RocketReach
```

Her servis aylık limitini doldurunda otomatik olarak sıradaki servise geçilir. Ay başında `rotator.reset_exhausted()` ile sıfırlanır.

## Kaggle Dataset'leri

Kullanılabilecek hazır dataset'ler:
1. [Companies in Turkey](https://www.kaggle.com/datasets/tueulucan/companies-in-turkey) → `data/` klasörüne indirin
2. [Top 500 Industrial Companies](https://www.kaggle.com/datasets/sadikemir/the-top-500-industrial-companies-of-trkiye) → `data/` klasörüne indirin
3. [Türkiye Firmalar Listesi](https://www.kaggle.com/code/aiwithcagri/t-rkiye-firmalar-listesi-csv) → `data/` klasörüne indirin

## Uyarı

Bu araç yalnızca halka açık verilerin toplanması ve legal B2B lead generation amaçlıdır. LinkedIn scraping, kişisel verilerin izinsiz toplanması veya KVKK ihlali durumlarında kullanılamaz.
