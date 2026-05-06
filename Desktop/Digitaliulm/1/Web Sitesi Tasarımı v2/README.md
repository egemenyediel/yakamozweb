
# Digital iulm Website

Modern, responsive website for Digital iulm with content management system.

## 🚀 Features

- ✨ Modern UI with blue neon theme (#0EA5E9)
- 🌐 Multi-language support (Turkish, German, English)
- 📱 Fully responsive design
- 🎬 Video hero section with autoplay
- 📊 13 digital solutions/services
- 🖼️ 4 reference projects with images
- 💬 Scroll-triggered chat widget
- 🔐 Admin panel for content management
- 💾 localStorage-based content persistence
- 📥 JSON export/import functionality
- ⚡ Vite ile hızlı geliştirme
- ⚛️ React 18 ve TypeScript
- 🎨 Tailwind CSS ile modern tasarım

## 🛠️ Kurulum ve Kullanım

### 1. Bağımlılıkları yükleyin:
```bash
npm install
```

### 2. Geliştirme modunda çalıştırın:

**Seçenek A: Sadece Frontend (Değişiklikler sadece tarayıcıda kalır)**
```bash
npm run dev
```

**Seçenek B: Frontend + API Server (ÖNERİLEN - Değişiklikler herkes tarafından görülür)**
```bash
# Terminal 1: API Server
npm run server

# Terminal 2: Frontend
npm run dev
```

Tarayıcıda otomatik olarak `http://localhost:3000/` açılır.
- Frontend: `http://localhost:3000/`
- API Server: `http://localhost:3001/`

### 3. Production build oluşturun:
```bash
npm run build
```

### 4. Production build'i önizleyin:
```bash
npm run preview
```
Build sonucu `http://localhost:4173/` adresinde test edilebilir.

## 🔐 Admin Panel

Admin panele erişim: `http://localhost:3000/#admin`

**Giriş Bilgileri:**
- Kullanıcı adı: `ege`
- Şifre: `ege`

### Admin Panel Özellikleri:

1. **Hero Section Yönetimi** - Ana sayfa başlık, alt başlık ve buton metni
2. **Çözümler Yönetimi** - 13 hizmet ekle/düzenle/sil
3. **Referanslar Yönetimi** - Proje referansları ekle/düzenle/sil
4. **İletişim Bilgileri** - Email, telefon, adres düzenleme
5. **JSON Export/Import** - İçeriği dosyaya kaydet/yükle

## 📝 Varsayılan İçerik

Web sitesi https://digitaliulm.de/ içerikleriyle yüklenmiştir:
- 13 Dijital Çözüm/Hizmet


## 💾 İçerik Yönetimi

### Nasıl Çalışır?

**API Server OLMADAN (Sadece npm run dev):**
- Değişiklikler sadece tarayıcının localStorage'ında saklanır
- Her kullanıcı kendi tarayıcısında farklı içerik görebilir
- Tarayıcı önbelleği silinirse değişiklikler kaybolur

**API Server ile (npm run server + npm run dev):**
- ✅ Değişiklikler `public/content.json` dosyasına kaydedilir
- ✅ Tüm kullanıcılar aynı içeriği görür
- ✅ `content.json` dosyasını Git'e commit ederek kalıcı hale getirin
- ✅ Server restart olsa bile içerik korunur

### Üretim (Production) Ortamında:

1. **content.json** dosyası Git'e commit edilir
2. Deploy edildiğinde herkes aynı içeriği görür
3. Admin panelde yapılan değişiklikler için:
   - Backend API kurulumu gerekir (Node.js sunucusu)
   - Veya Git'e manuel commit yapılmalı

## Deployment

Bu proje statik hosting servislerinde (Vercel, Netlify, GitHub Pages, vb.) çalışmak üzere optimize edilmiştir.

### Vercel
1. Vercel hesabınıza giriş yapın
2. "Import Project" butonuna tıklayın
3. GitHub repository'nizi seçin
4. Deploy butonuna tıklayın

### Netlify
1. Netlify hesabınıza giriş yapın
2. "New site from Git" butonuna tıklayın
3. GitHub repository'nizi seçin
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy butonuna tıklayın

## Geliştirme

Proje yapısı:
```
src/
├── components/        # React bileşenleri
├── styles/           # CSS dosyaları
└── main.tsx         # Ana giriş noktası
```

## Lisans

MIT  
