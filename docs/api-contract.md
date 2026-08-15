# Kontrak API (API Contract) - Frontend & Backend
Proyek: Website Sistem Informasi PCM Berbah

Dokumen ini adalah kesepakatan struktur data (JSON) yang akan digunakan untuk komunikasi antara Frontend (Vue/Nuxt) dan Backend (Express/MongoDB). Tim Backend **WAJIB** mengikuti struktur respons ini agar Frontend tidak mengalami error saat integrasi.

## 1. Format Respons Standar (Wajib untuk semua API)
Setiap kali Backend membalas *request*, format wajibnya adalah seperti ini:
```json
{
  "success": true,
  "message": "Pesan keberhasilan atau error",
  "data": { ... } // atau array [...]
}
```

## 2. API Authentication (Login)
**Endpoint:** `POST /api/auth/login`
**Payload (FE kirim):**
```json
{
  "username": "admin_sd1",
  "password": "password123"
}
```
**Respons Sukses (BE balas):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "1",
      "nama": "Budi",
      "role": "admin", // atau "super_admin"
      "instansi": "SD Muhammadiyah 1"
    }
  }
}
```

## 3. API Laporan Keuangan
**Endpoint:** `GET /api/keuangan`
**Deskripsi:** Mengambil data keuangan berdasarkan filter. Frontend akan menambahkan query string (contoh: `?aum_id=123&periode=bulanan`).
**Respons Sukses:**
```json
{
  "success": true,
  "message": "Data keuangan berhasil diambil",
  "data": [
    {
      "id": "k1",
      "aum_id": "123",
      "ranting_id": "r1",
      "jenis": "pemasukan",
      "nominal": 1500000,
      "keterangan": "SPP Bulan Juli",
      "tanggal": "2026-08-16T00:00:00Z"
    }
  ]
}
```

## 4. API Input Keuangan (Khusus Admin)
**Endpoint:** `POST /api/keuangan`
**Payload (FE kirim):** Header wajib menyertakan `Authorization: Bearer <token>`
```json
{
  "aum_id": "123",
  "jenis": "pengeluaran",
  "nominal": 500000,
  "keterangan": "Beli ATK",
  "tanggal": "2026-08-16"
}
```

## 5. API Data Wakaf
**Endpoint:** `GET /api/wakaf`
**Respons Sukses:**
```json
{
  "success": true,
  "message": "Data wakaf berhasil diambil",
  "data": [
    {
      "id": "w1",
      "aum_id": "123",
      "nama_aset": "Tanah Kosong",
      "jenis_aset": "Tanah",
      "lokasi": "Jl. Raya Berbah",
      "nilai_estimasi": 50000000
    }
  ]
}
```

---
*Catatan: Tabel berita tidak ada di API karena disepakati dibuat statis di Frontend.*
