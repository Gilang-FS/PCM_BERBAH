# Briefing Post UI/UX — PCM Berbah
> Dokumen ini dibuat sebagai panduan setelah pengerjaan UI/UX selesai.
> Panggil AI dengan membaca dokumen ini sebagai konteks awal sebelum memulai tahap finalisasi.

---

## Konteks Proyek

**Nama Proyek:** Sistem Informasi Keuangan, Wakaf, Keanggotaan, dan Profil PCM Berbah

**Tech Stack Frontend:** Nuxt 4 (Vue 3), Tailwind CSS

**Tech Stack Backend (rencana):** Express.js, MongoDB

**Direktori Frontend:** `frontend/`

**Dokumentasi API:** `docs/api-contract.md`

**Brief implementasi backend:** `docs/backend-brief.md`

**Konteks lengkap pengerjaan:** `AI-CONTEXT.md`

---

## Status Saat Dokumen Ini Dibuat

- UI/UX seluruh halaman publik dan admin **sudah selesai**
- Autentikasi masih **frontend-only** (mock via `NUXT_PUBLIC_USERS` + localStorage)
- Data keuangan, wakaf, pengguna masih tersimpan di **localStorage** (belum ke database)
- Hero profil AUM menggunakan **file lokal placeholder**; gambar mock aset wakaf masih menggunakan URL Unsplash
- Backend belum dibangun
- Audit frontend Tahap 1 telah dikerjakan secara statis dan production build berhasil; smoke test lintas perangkat tetap disarankan
- API Contract Tahap 2 dan brief backend Tahap 3 telah disiapkan

---

## Yang Harus Dikerjakan (Urutan)

### TAHAP 1 — Audit & Finalisasi Frontend

**Status:** Audit statis dan perbaikan prioritas selesai. Review browser lintas perangkat serta pengujian alur penuh tetap menjadi checklist QA sebelum production.

Minta AI untuk mengerjakan ini sebelum menyerahkan ke backend:

1. **Review visual** semua halaman di desktop, tablet, dan mobile
   - Halaman publik: `/`, `/wakaf`, `/keuangan`, `/struktur`
   - Halaman admin: `/admin/dashboard`, `/admin/keuangan`, `/admin/wakaf`, `/admin/users`, `/admin/profil`, `/admin/forbidden`
   - Fokus: overflow teks, wrapping, tabel, modal, filter, focus state, empty state

2. **Audit kode**
   - Hapus semua `console.log` yang tidak sengaja tertinggal
   - Hapus komentar debug / kode mati
   - Pastikan tidak ada `any` type yang tidak perlu di TypeScript

3. **Audit data mock**
   - Tandai semua field yang masih `-` (kosong) di `useAumProfiles.ts` agar backend tahu mana yang perlu diisi dari API
   - Ganti URL Unsplash di `useAumProfiles.ts` dengan path lokal placeholder yang jelas (`/images/placeholder-school.jpg`, dll)
   - Pastikan seed data di `frontend/.env` sudah final

4. **Audit aksesibilitas**
   - Semua form punya label yang benar
   - Semua modal punya focus trap dan Esc handler
   - Semua gambar punya `alt` yang deskriptif

---

### TAHAP 2 — Buat API Contract

**Status:** Selesai. Kontrak final tersedia di `docs/api-contract.md`.

Minta AI untuk melengkapi `docs/api-contract.md` dengan seluruh endpoint yang dibutuhkan frontend, mencakup:

| Modul | Method | Endpoint | Keterangan |
|---|---|---|---|
| Auth | POST | `/api/auth/login` | Login, return session cookie HttpOnly |
| Auth | GET | `/api/auth/session` | Ambil user dari session aktif |
| Auth | POST | `/api/auth/logout` | Hapus session |
| Auth | POST | `/api/auth/change-password` | Ganti password user aktif |
| Keuangan | GET | `/api/keuangan` | List transaksi (filter: aum, periode) |
| Keuangan | GET | `/api/keuangan/export-data` | Dataset lengkap untuk export admin |
| Keuangan | POST | `/api/keuangan` | Tambah transaksi |
| Keuangan | PATCH | `/api/keuangan/:id` | Edit transaksi |
| Keuangan | DELETE | `/api/keuangan/:id` | Hapus transaksi |
| Wakaf | GET | `/api/wakaf` | List aset wakaf (filter: aum) |
| Wakaf | POST | `/api/wakaf` | Tambah aset wakaf |
| Wakaf | PATCH | `/api/wakaf/:id` | Edit aset wakaf |
| Wakaf | DELETE | `/api/wakaf/:id` | Hapus aset wakaf |
| Pengguna | GET | `/api/users` | List pengguna (superadmin only) |
| Pengguna | POST | `/api/users` | Buat akun admin baru |
| Pengguna | PATCH | `/api/users/:id` | Edit akun admin |
| Pengguna | DELETE | `/api/users/:id` | Hapus akun admin |
| Profil AUM | GET | `/api/aum` | List profil semua AUM |
| Profil AUM | GET | `/api/aum/:slug` | Profil satu AUM |
| Upload | POST | `/api/upload` | Upload gambar, return URL |

> Detail struktur request/response, validasi, authorization, dan error code sudah tersedia di `docs/api-contract.md`.

---

### TAHAP 3 — Buat Handover Document untuk Backend

**Status:** Selesai. Brief implementasi tersedia di `docs/backend-brief.md`.

Minta AI untuk membuat file `docs/backend-brief.md` yang berisi:

1. **Daftar env variable** yang perlu disiapkan backend
2. **Struktur session/cookie** yang diharapkan frontend
3. **Format response API** yang sudah disepakati (success, error)
4. **Catatan keamanan** yang wajib diimplementasi backend:
   - Password hashing (bcrypt)
   - Session HttpOnly cookie (bukan localStorage)
   - Server-side authorization (jangan andalkan role dari client)
   - Rate limiting login (max 5x gagal → lockout)
   - Validasi input di server (jangan andalkan validasi frontend)
5. **Daftar file yang perlu dihapus/diganti** setelah backend siap:
   - `NUXT_PUBLIC_USERS` di `.env` → dihapus
   - `composables/useAuth.ts` bagian mock → diganti ke fetch API
   - `composables/useKeuangan.ts` bagian localStorage → diganti ke fetch API
   - `composables/useWakaf.ts` bagian localStorage → diganti ke fetch API
   - `composables/useUsers.ts` bagian localStorage → diganti ke fetch API

---

### TAHAP 4 — Migrasi Mock ke API (dikerjakan setelah backend siap)

Setelah backend selesai membangun endpoint, minta AI untuk:

1. Ganti `useAuth.ts` — login/logout/session dari API, bukan localStorage
2. Ganti `useKeuangan.ts` — CRUD dari API, bukan localStorage
3. Ganti `useWakaf.ts` — CRUD dari API, bukan localStorage
4. Ganti `useUsers.ts` — CRUD dari API, bukan localStorage
5. Ganti `useAumProfiles.ts` — profil dan gambar AUM dari API, bukan hardcode
6. Update middleware auth — validasi session dari server, bukan dari cookie client
7. Ganti semua URL gambar placeholder dengan URL dari VPS

---

## Catatan Penting untuk Backend

> Sampaikan poin-poin ini ke developer backend sebelum mereka mulai:

- **Jangan ubah struktur role** — hanya ada `admin` dan `superadmin`. Backend wajib menyimpan dan menegakkan field `role` dan `is_core`; jangan hanya mengandalkan logika frontend.
- **Cookie HttpOnly wajib** — frontend tidak akan menyimpan token di localStorage setelah integrasi. Backend harus return `Set-Cookie` dengan flag `HttpOnly`, `Secure`, `SameSite=Strict`.
- **Format error API harus konsisten** — frontend sudah siap menangani format:
  ```json
  { "success": false, "message": "Pesan error yang jelas", "error": { "code": "ERROR_CODE" } }
  ```
- **CORS** — pastikan backend mengizinkan request dari domain frontend (baik development maupun production).
- **Upload gambar** — frontend mengirim `multipart/form-data`, backend mengembalikan envelope standar dengan URL pada `data.url`.
- **Master AUM** — daftar 12 unit sudah final dan wajib mengikuti urutan di `docs/api-contract.md` (PCM Berbah selalu pertama). `Klinik PKU Muhammadiyah Berbah` adalah satu unit gabungan; `Lazismu Berbah` adalah unit ke-11 dan `Masjid` unit ke-12.

---

## Struktur Folder Frontend (Ringkasan)

```
frontend/
├── pages/
│   ├── index.vue          # Beranda publik
│   ├── wakaf.vue          # Halaman wakaf publik
│   ├── keuangan.vue       # Laporan keuangan publik
│   ├── struktur.vue       # Struktur organisasi publik
│   └── admin/
│       ├── dashboard.vue
│       ├── keuangan.vue
│       ├── wakaf.vue
│       ├── users.vue
│       ├── profil.vue
│       └── forbidden.vue
├── composables/
│   ├── useAuth.ts         # ⚠️ Perlu migrasi ke API
│   ├── useKeuangan.ts     # ⚠️ Perlu migrasi ke API
│   ├── useWakaf.ts        # ⚠️ Perlu migrasi ke API
│   ├── useUsers.ts        # ⚠️ Perlu migrasi ke API
│   ├── useAum.ts          # Master list AUM (tetap hardcode)
│   └── useAumProfiles.ts  # ⚠️ Profil & gambar perlu dari API
├── middleware/
│   ├── auth.ts            # ⚠️ Perlu update validasi session
│   └── guest.ts
├── layouts/
│   ├── default.vue        # Layout publik (card putih)
│   ├── home.vue           # Layout khusus beranda
│   └── admin.vue          # Layout admin
├── utils/
│   └── format.ts          # Helper format rupiah, tanggal
└── .env                   # ⚠️ NUXT_PUBLIC_USERS dihapus setelah backend siap
```

---

## Cara Memanggil AI dengan Dokumen Ini

Ketika UI/UX sudah selesai dan ingin memulai tahap finalisasi, sampaikan ke AI:

> *"Baca file HANDOVER.md dan AI-CONTEXT.md di root proyek, lalu bantu saya mulai dari Tahap 1."*

AI akan membaca kedua file tersebut, memahami konteks penuh proyek, dan langsung mengerjakan audit sesuai urutan tahap yang sudah didokumentasikan di sini.

---

*Dokumen ini dibuat pada tahap pengerjaan UI/UX PCM Berbah, sebelum integrasi backend.*
