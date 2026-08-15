# Panduan Penyimpanan Gambar & Aset

## Struktur Folder Aset di Proyek Ini

Di Nuxt.js, ada dua tempat untuk menyimpan file gambar/aset, dan keduanya punya fungsi yang berbeda:

### 1. `/public/` — File Statis (Langsung Diakses)
Gunakan untuk file yang perlu diakses langsung via URL, seperti:
- Logo resmi organisasi
- Favicon
- Gambar yang di-referensikan di `<img src="...">`

```
public/
├── images/
│   ├── logos/           ← Logo-logo resmi (Muhammadiyah, PCM Berbah, dll)
│   │   ├── logo-muhammadiyah-green.png
│   │   ├── logo-muhammadiyah-blue.png
│   │   └── logo-muhammadiyah-gold.png
│   └── assets/          ← Gambar konten (foto masjid, profil, dll)
│       ├── masjid.jpg
│       └── kegiatan.jpg
├── favicon.ico
└── robots.txt
```

**Cara Referensi di Kode:**
```html
<img src="/images/logos/logo-muhammadiyah-green.png" />
```

---

### 2. `/assets/` — File yang Diproses Vite
Gunakan untuk file CSS, Font, atau gambar yang diproses saat build:

```
assets/
├── css/
│   └── main.css         ← Global CSS
└── fonts/               ← Font lokal (opsional, kita sudah pakai Google Fonts)
```

**Cara Referensi di Kode:**
```html
<!-- Di <img> tag -->
<img src="~/assets/images/contoh.png" />

<!-- Di CSS -->
background-image: url('~/assets/images/contoh.png');
```

---

## Ringkasan Aturan Simpel
| Jenis File | Disimpan Di | Cara Akses |
|---|---|---|
| Logo resmi | `public/images/logos/` | `/images/logos/nama.png` |
| Foto konten | `public/images/assets/` | `/images/assets/nama.jpg` |
| CSS Global | `assets/css/` | `~/assets/css/nama.css` |
| Font Lokal | `assets/fonts/` | `~/assets/fonts/nama.woff2` |
