# Sistem Informasi PCM Berbah

Platform informasi publik dan administrasi internal Pimpinan Cabang Muhammadiyah Berbah untuk pengelolaan laporan keuangan, aset wakaf, profil unit/AUM, dan akun pengguna.

## Status Proyek

Frontend telah selesai sebagai baseline UI dan sudah dapat dijalankan untuk kebutuhan demo. Backend belum tersedia dan akan dikembangkan di direktori `backend/` berdasarkan kontrak API yang telah disepakati.

Implementasi frontend saat ini masih menggunakan data mock dan localStorage. Aplikasi belum boleh digunakan sebagai sistem production sebelum autentikasi, authorization, persistence database, upload, dan session server-side selesai diimplementasikan oleh backend.

## Fitur

### Halaman publik

- Profil dan informasi PCM Berbah.
- Profil 12 unit/AUM.
- Informasi aset wakaf per unit.
- Laporan keuangan dan ringkasan transaksi.
- Struktur organisasi PCM Berbah.

### Area admin

- Login dengan role `admin` dan `superadmin`.
- Dashboard dan ringkasan keuangan.
- Input transaksi oleh admin untuk AUM sendiri.
- Pengelolaan transaksi oleh superadmin.
- Pengelolaan aset wakaf oleh superadmin.
- Pengelolaan akun pengguna oleh superadmin.
- Perubahan password akun aktif.
- Export laporan Excel dan PDF.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | Nuxt 4, Vue 3, Tailwind CSS |
| Chart | ApexCharts |
| Export | ExcelJS, jsPDF, jsPDF AutoTable |
| Backend target | Express.js, MongoDB |
| Deployment target | Frontend hosting dan VPS Node.js |

## Struktur Repository

```text
PCM_BERBAH/
├── frontend/                # Aplikasi Nuxt
├── backend/                 # Area implementasi backend
├── docs/
│   ├── api-contract.md      # Kontrak normatif frontend-backend
│   ├── backend-brief.md     # Panduan implementasi backend
│   └── diagrams/            # Diagram dan referensi sistem
└── README.md
```

Direktori `backend/` dapat dibuat oleh tim backend. Perubahan bentuk endpoint, field, enum, atau response harus disepakati dan diperbarui pada `docs/api-contract.md` sebelum integrasi frontend.

## Menjalankan Frontend

Prasyarat:

- Node.js versi yang kompatibel dengan Nuxt 4.
- npm.

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Aplikasi development tersedia pada URL yang ditampilkan Nuxt, umumnya `http://localhost:3000`.

Perintah lain:

```bash
npm run build
npm run preview
```

Production build frontend terakhir berhasil. Repository belum menyediakan automated test runner; pengujian alur dan responsivitas tetap perlu dilakukan pada browser target.

## Konfigurasi Frontend

Gunakan `frontend/.env.example` sebagai contoh. Jangan commit `.env`, `.env.local`, password, token, URI database berkredensial, session secret, private key, atau credential VPS.

Environment frontend saat ini:

| Variable | Keterangan |
|---|---|
| `NUXT_PUBLIC_API_BASE` | Base URL backend |
| `NUXT_PUBLIC_USERS` | Seed login mock development; wajib dihapus setelah backend auth tersedia |

Semua variable dengan prefix `NUXT_PUBLIC_` dapat dibaca browser dan tidak boleh berisi secret.

## Dokumentasi Backend

Tim backend harus membaca dokumen berikut sebelum mulai:

1. [`docs/api-contract.md`](docs/api-contract.md) sebagai sumber normatif endpoint, request/response, enum, validasi, dan authorization.
2. [`docs/backend-brief.md`](docs/backend-brief.md) sebagai panduan environment, database, session, keamanan, seed, pengujian, dan acceptance criteria.

Keputusan domain utama:

- Total master adalah 12 unit termasuk PCM Berbah.
- `Klinik PKU Muhammadiyah Berbah` adalah satu unit gabungan.
- `Lazismu Berbah` adalah unit ke-11.
- Role hanya `admin` dan `superadmin`.
- Backend menggunakan server-side session melalui cookie HttpOnly.
- Server wajib menegakkan role dan scope AUM pada setiap operasi terproteksi.

## Peringatan Data Demo

Data transaksi, aset wakaf, akun, gambar, dan sebagian teks profil pada frontend dibuat untuk demonstrasi UI.

- Jangan mengimpor `INITIAL_DATA` dari composable frontend ke database production.
- Jangan memakai password mock sebagai credential production.
- Metadata AUM yang belum tersedia harus disimpan sebagai `null`, bukan dianggap data resmi.
- Gunakan data organisasi yang sudah diverifikasi sebelum peluncuran production.

## Alur Kerja Backend

1. Buat pekerjaan pada branch terpisah, misalnya `backend-dev`.
2. Implementasikan kode hanya di direktori `backend/` kecuali perubahan lintas proyek memang disepakati.
3. Ikuti `docs/api-contract.md`.
4. Commit `.env.example`, tetapi jangan commit `.env`.
5. Gunakan environment development atau staging terlebih dahulu.
6. Jalankan pengujian auth, role, scope AUM, validasi, upload, dan persistence.
7. Ajukan perubahan kontrak melalui Pull Request sebelum frontend diintegrasikan.

## Keamanan Production

Sebelum production, pastikan:

- Password di-hash menggunakan bcrypt.
- Session memakai cookie `HttpOnly`, `Secure`, dan `SameSite` yang sesuai deployment.
- Login mempunyai rate limiting dan lockout.
- CORS menggunakan allowlist origin, bukan wildcard.
- Semua input divalidasi server-side.
- Upload memverifikasi tipe dan isi file.
- Secret hanya disimpan pada environment deployment.
- Database dan file upload memiliki backup serta prosedur restore.
- Data bertahan setelah restart server.

Checklist lengkap tersedia di `docs/backend-brief.md`.
