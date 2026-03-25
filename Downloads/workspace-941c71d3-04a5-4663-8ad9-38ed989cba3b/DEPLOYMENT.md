# Deployment Guide

## Railway Deploy Ayarları

Bu proje Railway ile deployment için optimize edilmiştir.

### 1. **Çevresel Değişkenler (Environment Variables)**

Railway dashboard'da aşağıdaki değişkenleri ayarlayın:

```env
# PostgreSQL Database (Railway otomatik sağlar)
DATABASE_URL=postgresql://...

# Admin panel şifresi
ADMIN_PASSWORD=güçlü_şifre_girin

# Dosya storage yolu (Volume mount yapıldıktan sonra)
STORAGE_PATH=/data/uploads
```

### 2. **Volume Mount Kurulumu**

File upload özelliğinin çalışması için:

1. Railway Dashboard → Service → Volumes
2. "New" butonuna tıklayın
3. Configuration:
   - **Mount Path**: `/data/uploads`
   - **Size**: 2 GB (veya gerekli boyut)
4. `STORAGE_PATH` env değişkenine `/data/uploads` yazın

### 3. **PostgreSQL Database**

1. Railway Dashboard → New → Database → PostgreSQL
2. Bağlantı stringi otomatik `DATABASE_URL` olarak eklenir

### 4. **Build Process**

**Build Komutu:**
```bash
bun install && bunx prisma generate && bun run build
```

- Bun package manager kullanır
- Prisma client'ı generate eder
- Next.js standalone build oluşturur
- Prisma engine'ini standalone klasörüne kopyalar

### 5. **Start Process**

**Start Komutu:**
```bash
mkdir -p $STORAGE_PATH && NODE_ENV=production node .next/standalone/server.js
```

- Storage dizini oluşturur
- Node.js server'ı başlatır

### 6. **Health Check**

- **Type**: HTTP Path
- **Path**: `/api/route`
- **Timeout**: 60 saniye
- Response: `{"message": "Hello, world!"}`

### 7. **Restart Policy**

- **Type**: On Failure
- **Max Retries**: 3

## Troubleshooting

### Build başarısız olursa:

1. **Prisma schema güncellenmiş mi?**
   ```bash
   bunx prisma generate
   ```

2. **Dependencies yüklü mü?**
   ```bash
   bun install
   ```

3. **Node version kontrolü:**
   - `.node-version` dosyası: `20.9.0`
   - Railway ayarları: Node 20 LTS

### Deployment sonrası sorun varsa:

1. **Logs kontrol edin:** Railway → Deployments → Logs
2. **Environment variables doğru mu?**
3. **Database bağlantısı çalışıyor mu?**
4. **Storage path Volume'a mount edildi mi?**

## Teknik Detaylar

### Stack

- **Runtime**: Node.js 20.9+
- **Framework**: Next.js 16.1 (Turbopack)
- **Package Manager**: Bun (build), Node (runtime)
- **Database**: PostgreSQL dengan Prisma ORM
- **File Storage**: Local filesystem (volume mount)

### Build Output

```
.next/standalone/
├── server.js           # Entry point
├── .next/
│   ├── static/         # Static assets
│   └── server/         # Server-side bundles
├── public/             # Public assets
└── node_modules/
    ├── .prisma/        # Prisma engine
    └── @prisma/        # Prisma client
```

### Performance Optimizations

- ✅ Standalone build (küçük container)
- ✅ Prisma engine dahil
- ✅ Static asset optimization
- ✅ Turbopack ile hızlı build

## Deployment Checklist

- [ ] PostgreSQL database oluşturuldu
- [ ] DATABASE_URL env var set edildi
- [ ] ADMIN_PASSWORD set edildi
- [ ] Volume mount yapıldı
- [ ] STORAGE_PATH env var set edildi
- [ ] Build log'ları kontrol edildi
- [ ] Health check başarılı
- [ ] Admin paneline giriş testi

