# Kontrak API PCM Berbah

**Status:** Final untuk implementasi backend tahap pertama

**Frontend:** Nuxt 4 / Vue 3

**Backend target:** Express.js / MongoDB

**Base path:** `/api`

**Format:** JSON UTF-8, kecuali upload menggunakan `multipart/form-data`

Dokumen ini adalah kontrak integrasi antara frontend dan backend. Nama field, enum, format tanggal, aturan akses, dan bentuk respons di bawah harus dipertahankan agar migrasi frontend dari mock/localStorage ke API tidak membutuhkan perubahan domain tambahan.

## 1. Konvensi Umum

### 1.1 Transport dan autentikasi

- Seluruh production traffic wajib melalui HTTPS.
- Autentikasi memakai session cookie, bukan bearer token dan bukan token di localStorage.
- Frontend mengirim request terautentikasi dengan `credentials: 'include'`.
- Endpoint publik tetap boleh menerima cookie, tetapi tidak bergantung pada cookie.
- Content type JSON: `application/json`.
- Semua timestamp server menggunakan ISO 8601 UTC, contoh `2026-09-08T08:30:00.000Z`.
- Semua tanggal kalender menggunakan `YYYY-MM-DD`, bukan timestamp, contoh `2026-09-08`.
- Nominal disimpan sebagai bilangan bulat Rupiah tanpa pecahan.
- Semua ID dikirim sebagai string. Implementasi MongoDB boleh memakai ObjectId secara internal.

### 1.2 Format respons sukses

```json
{
  "success": true,
  "message": "Data berhasil diambil.",
  "data": {}
}
```

Untuk operasi tanpa payload, `data` bernilai `null`.

### 1.3 Format respons error

```json
{
  "success": false,
  "message": "Data yang dikirim tidak valid.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "nominal",
        "message": "Nominal harus lebih dari 0."
      }
    ]
  }
}
```

`error.details` opsional. Backend tidak boleh mengirim stack trace, query database, hash password, token, atau pesan internal mentah.

### 1.4 Status HTTP dan kode error

| Status | Kode | Penggunaan |
|---|---|---|
| `400` | `BAD_REQUEST` | JSON/query tidak dapat diproses |
| `400` | `VALIDATION_ERROR` | Field tidak memenuhi validasi |
| `401` | `AUTH_REQUIRED` | Session tidak ada atau kedaluwarsa |
| `401` | `INVALID_CREDENTIALS` | Username/password salah |
| `403` | `FORBIDDEN` | Role atau AUM tidak diizinkan |
| `404` | `NOT_FOUND` | Resource tidak ditemukan |
| `409` | `USERNAME_TAKEN` | Username sudah digunakan |
| `409` | `RESOURCE_CONFLICT` | Resource berubah/berkonflik |
| `413` | `FILE_TOO_LARGE` | Upload melewati batas |
| `415` | `UNSUPPORTED_FILE_TYPE` | Tipe file tidak didukung |
| `422` | `INVALID_CURRENT_PASSWORD` | Password saat ini salah |
| `429` | `LOGIN_LOCKED` | Login dikunci sementara |
| `429` | `RATE_LIMITED` | Rate limit umum terlampaui |
| `500` | `INTERNAL_ERROR` | Kesalahan server yang sudah disanitasi |

### 1.5 Pagination

Endpoint list menerima:

- `page`: integer, default `1`, minimum `1`.
- `limit`: integer, default `20`, minimum `1`, maksimum `100`.

Respons list:

```json
{
  "success": true,
  "message": "Data berhasil diambil.",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "total_pages": 0
  }
}
```

Urutan list harus deterministik. Jika dua record memiliki tanggal sama, urutkan lagi berdasarkan `created_at` lalu `id`.

## 2. Master AUM

Nama AUM bersifat kanonis dan case-sensitive pada payload/response. Backend harus menolak nama di luar daftar ini. Urutan wajib dipertahankan.

| Urutan | Nama | Slug |
|---:|---|---|
| 1 | PCM Berbah | `pcm-berbah` |
| 2 | SD Muhammadiyah Karangharjo | `sd-muhammadiyah-karangharjo` |
| 3 | SD Muhammadiyah Pajangan 1 | `sd-muhammadiyah-pajangan-1` |
| 4 | SD Muhammadiyah Pajangan 2 | `sd-muhammadiyah-pajangan-2` |
| 5 | SD Muhammadiyah Noyokerten | `sd-muhammadiyah-noyokerten` |
| 6 | SD Muhammadiyah Semoya | `sd-muhammadiyah-semoya` |
| 7 | SD Muhammadiyah Bulu | `sd-muhammadiyah-bulu` |
| 8 | SMP Muhammadiyah 1 Berbah | `smp-muhammadiyah-1-berbah` |
| 9 | SMK Muhammadiyah Berbah | `smk-muhammadiyah-berbah` |
| 10 | Klinik PKU Muhammadiyah Berbah | `klinik-pku-muhammadiyah-berbah` |
| 11 | Lazismu Berbah | `lazismu-berbah` |
| 12 | Masjid | `masjid` |

`PKU Muhammadiyah Berbah`, `Klinik PKU`, dan `Klinik Muhammadiyah` adalah nama legacy untuk unit yang sama, yaitu `Klinik PKU Muhammadiyah Berbah`. Backend hanya mengembalikan nama kanonis.

## 3. Model Data

### 3.1 SessionUser

```json
{
  "id": "66de9b2a4f1d0c0012abcd01",
  "username": "admin_karangharjo",
  "role": "admin",
  "aum": "SD Muhammadiyah Karangharjo",
  "is_core": false
}
```

Aturan:

- `role`: hanya `admin` atau `superadmin`.
- `aum`: wajib berupa nama AUM kanonis untuk admin; `null` untuk superadmin.
- `is_core`: hanya boleh `true` untuk satu superadmin inti.
- Password dan hash password tidak pernah dikirim ke frontend.

### 3.2 Transaction

```json
{
  "id": "66de9b2a4f1d0c0012abcd02",
  "tanggal": "2026-09-08",
  "kode_akun": "4101",
  "keterangan": "Penerimaan layanan bulan September",
  "tipe": "pemasukan",
  "nominal": 1500000,
  "aum": "SD Muhammadiyah Karangharjo",
  "diedit_oleh": null,
  "diedit_pada": null,
  "created_at": "2026-09-08T08:30:00.000Z",
  "updated_at": "2026-09-08T08:30:00.000Z"
}
```

`tipe` diturunkan backend dari `kode_akun`. Backend tidak boleh mempercayai nilai `tipe` dari client.

### 3.3 WakafAsset

```json
{
  "id": "66de9b2a4f1d0c0012abcd03",
  "aum": "PCM Berbah",
  "jenis_aset": "Tanah Wakaf",
  "lokasi": "Tegaltirto, Berbah, Sleman",
  "status": "Aktif",
  "nominal": 50000000,
  "tanggal": "2026-09-08",
  "image": "https://api.pcmberbah.example/uploads/wakaf/example.webp",
  "keterangan": "Digunakan untuk kegiatan pelayanan umat.",
  "diedit_oleh": null,
  "diedit_pada": null,
  "created_at": "2026-09-08T08:30:00.000Z",
  "updated_at": "2026-09-08T08:30:00.000Z"
}
```

### 3.4 User

```json
{
  "id": "66de9b2a4f1d0c0012abcd04",
  "username": "admin_karangharjo",
  "role": "admin",
  "aum": "SD Muhammadiyah Karangharjo",
  "is_core": false,
  "created_at": "2026-09-08T08:30:00.000Z",
  "updated_at": "2026-09-08T08:30:00.000Z"
}
```

### 3.5 AumProfile

Struktur `info` sengaja mengikuti struktur frontend saat ini.

```json
{
  "id": "66de9b2a4f1d0c0012abcd05",
  "name": "Lazismu Berbah",
  "slug": "lazismu-berbah",
  "order": 11,
  "hero": "https://api.pcmberbah.example/uploads/aum/lazismu.webp",
  "profile": "Profil singkat Lazismu Berbah.",
  "info": [
    { "label": "Nama Resmi", "value": null },
    { "label": "Tahun Berdiri", "value": null },
    { "label": "Alamat", "value": null },
    { "label": "Email", "value": null }
  ],
  "updated_at": "2026-09-08T08:30:00.000Z"
}
```

Backend menggunakan `null` untuk informasi yang belum tersedia. Frontend akan menampilkan fallback yang sesuai. Urutan `info` wajib: Nama Resmi, Tahun Berdiri, Alamat, Email.

## 4. Chart of Accounts

Backend harus memakai kode dan relasi tipe berikut.

| Kode | Nama | Tipe | Kelompok |
|---|---|---|---|
| `4101` | Pendapatan - Jasa 1 | pemasukan | utama |
| `4102` | Pendapatan - Jasa 2 | pemasukan | utama |
| `4103` | Pendapatan - Jasa 3 | pemasukan | utama |
| `7100` | Bunga Bank | pemasukan | lain-lain |
| `6100` | Beban - Gaji Karyawan | pengeluaran | utama |
| `6110` | Beban - Administrasi | pengeluaran | utama |
| `6120` | Beban - Listrik, Air, Telpon | pengeluaran | utama |
| `6130` | Beban - Sewa Kantor | pengeluaran | utama |
| `6140` | Beban - Asuransi | pengeluaran | utama |
| `6150` | Beban - Service dan Perawatan | pengeluaran | utama |
| `6160` | Beban - Perlengkapan Kantor | pengeluaran | utama |
| `6170` | Beban - Penyusutan Perangkat Elektronik | pengeluaran | utama |
| `6180` | Beban - Penyusutan Mobil dan Motor | pengeluaran | utama |
| `6190` | Beban - Bahan Habis Pakai | pengeluaran | utama |
| `6200` | Beban - Alat Tulis Kantor | pengeluaran | utama |
| `6210` | Beban - Rumah Tangga Kantor | pengeluaran | utama |
| `6220` | Beban - Pemasaran/Iklan/Entertainment | pengeluaran | utama |
| `6230` | Beban - Training | pengeluaran | utama |
| `6240` | Beban - Iuran/Retribusi | pengeluaran | utama |
| `6250` | Beban - Penyusutan Furnitur | pengeluaran | utama |
| `6260` | Beban - Operasional Karyawan | pengeluaran | utama |
| `8100` | Beban - Bunga Bank | pengeluaran | lain-lain |
| `8200` | Administrasi Bank | pengeluaran | lain-lain |

## 5. Matriks Akses

| Operasi | Publik | Admin | Superadmin |
|---|:---:|:---:|:---:|
| Baca profil AUM | Ya | Ya | Ya |
| Baca keuangan publik | Ya, seluruh AUM | Ya, seluruh AUM | Ya, seluruh AUM |
| Baca data admin/export keuangan | Tidak | Hanya AUM sendiri | Semua AUM |
| Tambah keuangan | Tidak | Hanya AUM sendiri | Semua AUM |
| Edit/hapus keuangan | Tidak | Tidak | Ya |
| Baca wakaf | Ya | Ya | Ya |
| Tambah/edit/hapus wakaf | Tidak | Tidak | Ya |
| Baca/kelola pengguna | Tidak | Tidak | Ya |
| Ganti password sendiri | Tidak | Ya | Ya |

Authorization wajib ditegakkan backend pada setiap request. Nilai role, AUM, username, `is_core`, `diedit_oleh`, dan `diedit_pada` tidak boleh dipercaya dari client.

## 6. Endpoint Auth

### 6.1 Login

`POST /api/auth/login`

**Akses:** Publik

```json
{
  "username": "admin_karangharjo",
  "password": "password-rahasia",
  "remember": false
}
```

Validasi:

- `username`: string, wajib, trim, 3-64 karakter.
- `password`: string, wajib, maksimum 128 karakter pada endpoint login.
- `remember`: boolean, default `false`.
- Pesan kredensial salah tidak boleh membedakan username tidak ditemukan dan password salah.

Respons `200` mengatur session cookie dan mengembalikan:

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "user": {
      "id": "66de9b2a4f1d0c0012abcd01",
      "username": "admin_karangharjo",
      "role": "admin",
      "aum": "SD Muhammadiyah Karangharjo",
      "is_core": false
    }
  }
}
```

Tidak ada `token` atau `refresh_token` dalam JSON. Jika `remember=false`, gunakan session cookie tanpa `Max-Age`. Jika `remember=true`, masa session yang disarankan 30 hari, tetap dengan rotasi dan revocation server-side.

### 6.2 Session aktif

`GET /api/auth/session`

**Akses:** Admin atau superadmin

Respons `200`:

```json
{
  "success": true,
  "message": "Session aktif.",
  "data": {
    "user": {
      "id": "66de9b2a4f1d0c0012abcd01",
      "username": "admin_karangharjo",
      "role": "admin",
      "aum": "SD Muhammadiyah Karangharjo",
      "is_core": false
    }
  }
}
```

Session tidak valid atau kedaluwarsa mengembalikan `401 AUTH_REQUIRED` dan menghapus cookie yang tersisa.

### 6.3 Logout

`POST /api/auth/logout`

**Akses:** Publik/idempotent. Session valid tidak diwajibkan.

Backend selalu mencoba revoke session jika ditemukan, selalu mengirim cookie session kedaluwarsa, dan selalu mengembalikan `200` meskipun cookie/session sudah tidak ada atau tidak valid.

Respons `200` menghapus/revoke session server dan mengirim cookie kedaluwarsa:

```json
{
  "success": true,
  "message": "Logout berhasil.",
  "data": null
}
```

### 6.4 Ganti password sendiri

`POST /api/auth/change-password`

**Akses:** Admin atau superadmin

```json
{
  "current_password": "password-lama",
  "new_password": "password-baru"
}
```

Validasi:

- Password lama harus cocok.
- Password baru minimum 6 dan maksimum 128 karakter.
- Password baru tidak boleh sama dengan password lama.
- Setelah berhasil, revoke seluruh session milik user tersebut, termasuk session request saat ini.

Respons `200` menghapus cookie session:

```json
{
  "success": true,
  "message": "Password berhasil diubah. Silakan login kembali.",
  "data": null
}
```

## 7. Endpoint Keuangan

### 7.1 Daftar transaksi

`GET /api/keuangan`

**Akses:** Publik, admin, atau superadmin

Query:

- `aum`: nama AUM kanonis. Jika tidak dikirim atau bernilai `Semua AUM`, default seluruh AUM. Endpoint ini merupakan sumber laporan publik, sehingga semua pengunjung, termasuk user yang sedang login sebagai admin, boleh membaca AUM mana pun. Pembatasan AUM admin hanya berlaku pada mutasi dan endpoint dataset admin/export.
- `periode`: `harian`, `bulanan`, `6_bulanan`, `terbaru`, `hari_ini`, `bulan_ini`, atau `rentang`; default `terbaru`.
- `dari`: tanggal awal, wajib bila `periode=rentang`.
- `sampai`: tanggal akhir, wajib bila `periode=rentang`.
- `tipe`: `semua`, `pemasukan`, atau `pengeluaran`; default `semua`.
- `sort`: saat ini hanya `tanggal_desc` sebagai default dan `tanggal_asc`.
- `page`, `limit`: mengikuti pagination umum.

Aturan periode:

- `harian`/`hari_ini`: tanggal server hari ini dalam timezone aplikasi `Asia/Jakarta`.
- `bulanan`/`bulan_ini`: bulan kalender saat ini sampai hari ini.
- `6_bulanan`: awal bulan lima bulan sebelum bulan berjalan sampai hari ini.
- `terbaru`: transaksi terbaru; default `limit=20` bila limit tidak dikirim.
- `rentang`: inklusif dari `dari` sampai `sampai`; `sampai` tidak boleh sebelum `dari` atau melewati hari ini.

Respons memakai array `Transaction` dan metadata pagination. `meta.summary` serta `meta.categories` dihitung dari seluruh hasil filter sebelum pagination, bukan hanya page saat ini.

```json
{
  "success": true,
  "message": "Data keuangan berhasil diambil.",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "total_pages": 0,
    "summary": {
      "total_pemasukan": 0,
      "total_pengeluaran": 0,
      "saldo": 0
    },
    "categories": [
      {
        "kode_akun": "4101",
        "nama": "Pendapatan - Jasa 1",
        "tipe": "pemasukan",
        "kelompok": "utama",
        "total": 0
      }
    ]
  }
}
```

### 7.2 Dataset laporan/export

`GET /api/keuangan/export-data`

**Akses:** Admin atau superadmin

Query filter sama dengan daftar transaksi, tanpa `page` dan `limit`.

- Admin selalu dibatasi ke AUM session; query AUM lain menghasilkan `403`.
- Superadmin wajib mengirim satu AUM kanonis. Export gabungan seluruh AUM belum dibutuhkan frontend.
- Rentang maksimum adalah 12 bulan kalender per request.
- Jumlah maksimum adalah 10.000 record. Jika terlampaui, kembalikan `400 VALIDATION_ERROR` dengan detail batas dan minta rentang dipersempit.
- Respons mengembalikan seluruh `Transaction` yang cocok, `summary`, dan `categories` agar frontend dapat membentuk Excel/PDF secara konsisten.

Endpoint ini mengembalikan JSON, bukan file. Pembuatan Excel/PDF tetap dilakukan frontend.

Respons `200` normatif, tanpa field pagination:

```json
{
  "success": true,
  "message": "Dataset export berhasil diambil.",
  "data": [],
  "meta": {
    "summary": {
      "total_pemasukan": 0,
      "total_pengeluaran": 0,
      "saldo": 0
    },
    "categories": [
      {
        "kode_akun": "4101",
        "nama": "Pendapatan - Jasa 1",
        "tipe": "pemasukan",
        "kelompok": "utama",
        "total": 0
      }
    ]
  }
}
```

`data` adalah seluruh array `Transaction` yang cocok dan tidak dipaginasi. `meta` endpoint ini tidak memiliki `page`, `limit`, `total`, atau `total_pages`.

### 7.3 Tambah transaksi

`POST /api/keuangan`

**Akses:** Admin atau superadmin

```json
{
  "tanggal": "2026-09-08",
  "kode_akun": "4101",
  "keterangan": "Penerimaan layanan bulan September",
  "nominal": 1500000,
  "aum": "SD Muhammadiyah Karangharjo"
}
```

Validasi:

- `tanggal`: wajib, tanggal valid, tidak melewati hari ini.
- `kode_akun`: wajib dan terdaftar pada Chart of Accounts.
- `keterangan`: string opsional, trim, maksimum 500 karakter.
- `nominal`: integer, minimum `1`, maksimum `9007199254740991`.
- `aum`: wajib untuk superadmin. Untuk admin, backend mengabaikan nilai client dan memakai AUM session.
- `tipe`, ID, dan field audit dibuat backend.

Respons `201` mengembalikan `Transaction` yang dibuat.

### 7.4 Edit transaksi

`PATCH /api/keuangan/:id`

**Akses:** Superadmin saja

Payload dapat berisi sebagian atau semua field mutable:

```json
{
  "tanggal": "2026-09-08",
  "kode_akun": "6190",
  "keterangan": "Pembelian bahan habis pakai",
  "nominal": 450000,
  "aum": "Klinik PKU Muhammadiyah Berbah"
}
```

Minimal satu field harus dikirim. Validasi sama dengan endpoint tambah. Backend menetapkan `diedit_oleh` dari username session serta `diedit_pada` dan `updated_at` dari waktu server.

Respons `200` mengembalikan `Transaction` terbaru.

### 7.5 Hapus transaksi

`DELETE /api/keuangan/:id`

**Akses:** Superadmin saja

Respons `200`:

```json
{
  "success": true,
  "message": "Transaksi berhasil dihapus.",
  "data": { "id": "66de9b2a4f1d0c0012abcd02" }
}
```

## 8. Endpoint Wakaf

### 8.1 Daftar aset wakaf

`GET /api/wakaf`

**Akses:** Publik, admin, atau superadmin

Query:

- `aum`: nama AUM kanonis; jika tidak dikirim, kembalikan seluruh AUM.
- `status`: opsional, `Aktif` atau `Proses`.
- `sort`: `tanggal_desc` sebagai default atau `tanggal_asc`.
- `page`, `limit`.

Respons memakai array `WakafAsset` dan metadata pagination. `meta.summary` dihitung dari seluruh hasil filter sebelum pagination:

```json
{
  "page": 1,
  "limit": 20,
  "total": 0,
  "total_pages": 0,
  "summary": {
    "total_aset": 0,
    "aset_aktif": 0,
    "total_nilai": 0
  }
}
```

Frontend Tahap 4 harus memakai `meta.summary` untuk kartu ringkasan. Untuk menampilkan seluruh kartu tanpa pagination UI, frontend harus mengambil page berikutnya sampai selesai; alternatifnya tambahkan pagination UI saat integrasi.

### 8.2 Tambah aset wakaf

`POST /api/wakaf`

**Akses:** Superadmin saja

```json
{
  "aum": "PCM Berbah",
  "jenis_aset": "Tanah Wakaf",
  "lokasi": "Tegaltirto, Berbah, Sleman",
  "status": "Aktif",
  "nominal": 50000000,
  "tanggal": "2026-09-08",
  "image": "https://api.pcmberbah.example/uploads/wakaf/example.webp",
  "keterangan": "Digunakan untuk kegiatan pelayanan umat."
}
```

Validasi:

- `aum`: wajib dan harus kanonis.
- `jenis_aset`: wajib, trim, 1-150 karakter.
- `lokasi`: wajib, trim, 1-300 karakter.
- `status`: `Aktif` atau `Proses`.
- `nominal`: integer, minimum `0`, maksimum `9007199254740991`.
- `tanggal`: wajib, valid, tidak melewati hari ini.
- `image`: URL HTTPS dari layanan upload milik aplikasi; boleh `null` bila backend menyediakan placeholder lokal/default.
- `keterangan`: opsional, maksimum 1000 karakter.
- ID dan field audit dibuat backend.

Respons `201` mengembalikan `WakafAsset` yang dibuat.

### 8.3 Edit aset wakaf

`PATCH /api/wakaf/:id`

**Akses:** Superadmin saja

Payload berisi minimal satu field mutable dari payload tambah. Backend menetapkan `diedit_oleh`, `diedit_pada`, dan `updated_at`.

Respons `200` mengembalikan `WakafAsset` terbaru.

### 8.4 Hapus aset wakaf

`DELETE /api/wakaf/:id`

**Akses:** Superadmin saja

Respons `200` mengembalikan `{ "id": "..." }`. Penghapusan file gambar fisik harus aman: jangan hapus file yang masih direferensikan resource lain.

## 9. Endpoint Pengguna

Semua endpoint di bagian ini hanya untuk superadmin. Password/hash tidak pernah muncul dalam response atau log.

### 9.1 Daftar pengguna

`GET /api/users`

Query:

- `role`: opsional, `admin` atau `superadmin`.
- `aum`: opsional, nama AUM kanonis.
- `page`, `limit`.

Urutan default: superadmin inti, superadmin backup, kemudian admin; pada kelompok yang sama urutkan `created_at` ascending lalu `id` ascending sebagai tie-break.

Respons memakai array `User` dan `meta` pagination.

### 9.2 Buat akun admin

`POST /api/users`

```json
{
  "username": "admin_lazismu",
  "password": "password-awal",
  "aum": "Lazismu Berbah"
}
```

Aturan:

- Endpoint hanya boleh membuat role `admin`; field `role` dari client harus ditolak atau diabaikan secara konsisten.
- `username`: wajib, trim, 3-64 karakter, unik case-insensitive.
- Karakter username yang direkomendasikan: huruf, angka, titik, garis bawah, dan tanda hubung.
- `password`: 6-128 karakter pada kompatibilitas awal; kebijakan lebih kuat boleh diterapkan jika disepakati frontend.
- `aum`: wajib dan kanonis.

Respons `201` mengembalikan `User` tanpa password.

### 9.3 Edit akun

`PATCH /api/users/:id`

```json
{
  "username": "admin_lazismu",
  "aum": "Lazismu Berbah",
  "password": "password-reset-opsional"
}
```

Aturan:

- `role` dan `is_core` tidak dapat diubah melalui endpoint ini.
- Akun superadmin inti tidak dapat diedit oleh siapa pun melalui endpoint users.
- Superadmin tidak dapat mengedit dirinya sendiri melalui endpoint users; ganti password sendiri memakai endpoint auth.
- Superadmin backup hanya dapat diedit oleh superadmin inti.
- Semua superadmin dapat mengedit admin.
- `aum` wajib untuk admin dan harus `null`/diabaikan untuk superadmin.
- `password` opsional; jika dikirim, hash baru dibuat server dan seluruh session target direvoke.

Respons `200` mengembalikan `User` terbaru.

### 9.4 Hapus akun

`DELETE /api/users/:id`

Aturan proteksi sama dengan edit:

- Akun inti tidak dapat dihapus.
- Aktor tidak dapat menghapus dirinya sendiri.
- Superadmin backup hanya dapat dihapus oleh superadmin inti.
- Admin dapat dihapus oleh semua superadmin.

Respons `200` mengembalikan `{ "id": "..." }` dan backend merevoke seluruh session target.

## 10. Endpoint Profil AUM

### 10.1 Daftar seluruh profil

`GET /api/aum`

**Akses:** Publik

Respons `200` mengembalikan 12 object `AumProfile`, selalu berdasarkan `order` ascending. Endpoint ini tidak dipaginasi karena master bersifat kecil dan tetap.

### 10.2 Profil berdasarkan slug

`GET /api/aum/:slug`

**Akses:** Publik

Slug harus sesuai tabel master AUM. Respons `200` mengembalikan satu `AumProfile`; slug tidak dikenal menghasilkan `404 NOT_FOUND`.

Profil AUM saat ini tidak memiliki halaman CRUD frontend. Pembaruan data dilakukan melalui seed/migrasi backend atau tooling internal sampai endpoint pengelolaan disepakati terpisah.

## 11. Endpoint Upload

### 11.1 Upload gambar

`POST /api/upload`

**Akses:** Superadmin saja

Content type: `multipart/form-data`

Field:

- `file`: wajib, satu file.
- `purpose`: wajib, `wakaf` atau `aum`.

Validasi minimum:

- MIME yang diterima: `image/jpeg`, `image/png`, `image/webp`.
- Verifikasi magic bytes, jangan hanya extension atau header MIME.
- Ukuran maksimum 5 MB.
- Nama file dibuat server; nama asli tidak dipakai sebagai path.
- Hilangkan metadata sensitif dan lakukan re-encode bila memungkinkan.
- Simpan di luar source code aplikasi atau object storage.

Respons `201`:

```json
{
  "success": true,
  "message": "Gambar berhasil diunggah.",
  "data": {
    "url": "https://api.pcmberbah.example/uploads/wakaf/8f4b2c.webp",
    "mime_type": "image/webp",
    "size": 245120
  }
}
```

URL harus dapat dipakai langsung pada field `image` atau `hero`.

## 12. Cookie dan Proteksi Request

Nama cookie yang direkomendasikan: `pcm_session`.

Production:

```text
HttpOnly; Secure; SameSite=Strict; Path=/
```

Ketentuan:

- Session ID harus acak kriptografis dan opaque; data role/AUM tidak dipercayakan pada cookie client.
- Simpan hanya hash session ID di database bila memungkinkan.
- Rotasi session ID saat login dan setelah perubahan privilege.
- Revoke session saat logout, reset password, penghapusan akun, atau akun dinonaktifkan.
- Validasi header `Origin` pada seluruh method mutasi.
- Jika deployment frontend/backend mengharuskan cross-site cookie, perubahan `SameSite` dan mekanisme CSRF wajib disepakati ulang; jangan menurunkan ke `SameSite=None` tanpa token CSRF.
- CORS harus memakai allowlist origin eksplisit dan `Access-Control-Allow-Credentials: true`; wildcard origin dilarang.

## 13. Acceptance Contract

Backend dianggap kompatibel dengan frontend jika seluruh poin berikut terpenuhi:

- Tidak ada token autentikasi atau password di response JSON/localStorage.
- `GET /api/auth/session` menjadi sumber kebenaran user aktif.
- Semua nama role dan AUM memakai enum/nama kanonis dokumen ini.
- Admin tidak dapat membaca dataset admin/export atau menulis data AUM lain melalui request yang dimanipulasi. Laporan pada `GET /api/keuangan` tetap publik untuk seluruh AUM dan bukan batas kerahasiaan.
- Admin tidak dapat edit/hapus keuangan atau mengelola wakaf/pengguna.
- Proteksi superadmin inti/backup ditegakkan backend.
- List endpoint memiliki pagination dan urutan deterministik.
- Ringkasan keuangan/wakaf dihitung dari seluruh hasil filter sebelum pagination.
- Dataset export dibatasi AUM session untuk admin dan tidak terpotong pagination.
- Tanggal kalender dan timestamp tidak tertukar.
- `tipe` transaksi diturunkan dari Chart of Accounts.
- Seluruh error memakai envelope standar dan tidak membocorkan detail internal.
- Upload menolak file non-gambar, file terlalu besar, dan path berbahaya.
- Data serta session tetap konsisten setelah server restart.
