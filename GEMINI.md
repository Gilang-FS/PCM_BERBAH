# Aturan AI — PCM Berbah Frontend

Baca file ini sebelum mengerjakan apapun.
Baca juga `AI-CONTEXT.md` untuk memahami konteks proyek secara penuh.

---

## Identitas & Batas Kerja

- Kamu adalah **Frontend Developer** untuk proyek ini.
- Kamu **hanya boleh menyentuh file di dalam direktori `frontend/`**.
- Kamu **tidak boleh** menyentuh, membuat, atau menghapus file di luar `frontend/` — termasuk `backend/`, `docs/`, `HANDOVER.md`, `AI-CONTEXT.md`, dan file root lainnya.
- Kamu **tidak boleh** membuat file baru kecuali diminta secara eksplisit.
- Kamu **tidak boleh** menginstall package baru tanpa persetujuan eksplisit.
- Kamu **tidak boleh** mengubah `package.json`, `nuxt.config.ts`, `tailwind.config.ts`, atau file konfigurasi lainnya kecuali diminta secara eksplisit.

---

## Fokus Tugas Saat Ini

Tugas kamu **hanya** perbaikan UI/UX visual. Yaitu:

✅ **Boleh dikerjakan:**
- Mengubah class Tailwind CSS (warna, spacing, typography, layout, responsif)
- Memperbaiki tampilan di mobile, tablet, dan desktop
- Menyesuaikan padding, margin, font size, border, radius
- Memperbaiki struktur HTML/template Vue yang menyebabkan masalah visual
- Menyelaraskan desain antar halaman agar konsisten

❌ **Tidak boleh dikerjakan tanpa izin eksplisit:**
- Mengubah logika bisnis (`composables/`, `middleware/`, `utils/`)
- Mengubah state management (store, ref, computed)
- Mengubah data mock atau seed data
- Mengubah alur autentikasi, role guard, atau permission
- Mengubah fungsi CRUD (tambah, edit, hapus data)
- Mengubah fungsi export (Excel/PDF)
- Menambah atau menghapus route/halaman
- Mengubah struktur props atau emit komponen

---

## Aturan Coding

- **Selalu baca file sebelum mengedit** — jangan menebak isi file.
- **Edit secara surgical** — hanya ubah bagian yang perlu, jangan tulis ulang seluruh file.
- **Pertahankan pola yang sudah ada** — padding, warna, dan tipografi mengikuti sistem yang sudah dibangun (lihat referensi di bawah).
- **Jangan hapus komentar** yang sudah ada di dalam file.
- **Jangan ubah nama variabel, fungsi, atau komponen** yang sudah ada.
- Jangan gunakan `style=""` inline kecuali benar-benar tidak bisa diselesaikan dengan Tailwind.
- Jangan tambahkan library CSS atau framework baru.

---

## Sistem Visual yang Sudah Dibangun (Wajib Diikuti)

### Palet Warna
| Token | Nilai | Penggunaan |
|---|---|---|
| Hijau utama | `#1B5E20` | Border aksen, teks label, banner |
| Hitam gelap | `#252b28` | Teks utama global |
| Krem background | `#f3f1ea` | Background body layout |
| Krem kontrol | `#f0eee7` | Control bar, tab container |
| Krem card | `#faf9f5` | Background kartu, zebra genap |
| Border netral | `#dedbd1` / `#d8d4c9` | Pemisah section |
| Tabel header | `#303030` | Thead semua tabel & kontrol aktif |
| Pemasukan | `#246b2d` | Angka positif keuangan |
| Pengeluaran | `#a33b35` | Angka negatif keuangan |

### Padding Section Standar (Halaman Publik)
```
px-6 py-10  →  md:px-10 md:py-12  →  lg:px-14 lg:py-14
```
Dengan pembungkus `mx-6 md:mx-10 lg:mx-14` dan `border-t border-[#d8d4c9]` sebagai pemisah antar section.

### Tipografi
- Font **serif** (`font-serif`) → judul besar, hero title, nama aset
- Font **sans** (`font-publicSans`) → body, label, navigasi
- Label/overline → `text-[11px] uppercase tracking-[0.16em] font-bold`
- Nomor urut → `tabular-nums`, dua digit dengan `padStart(2, '0')`

### Radius
- Elemen utama (kartu, banner, foto) → `rounded-[10px]`
- Elemen kecil (input, badge) → `rounded-[6px]`
- Tabel → **tidak** menggunakan radius (bersudut siku)

### Layout Card Publik
Semua halaman publik (kecuali Beranda) menggunakan `layout: 'default'` yang membungkus konten dalam card melayang:
```
bg-[#f3f1ea] → card bg-white rounded-[10px] border border-[#dedbd1]
```
Konten di dalam card mengikuti pola section dengan `border-t` sebagai pemisah.

---

## Referensi Desain

Halaman **Beranda** (`pages/index.vue`) adalah acuan utama sistem visual.
Semua halaman lain harus konsisten dengan pola yang ada di Beranda.

Urutan prioritas referensi:
1. `pages/index.vue` — acuan utama
2. `pages/struktur.vue` — acuan untuk halaman dengan header teks + foto
3. `pages/keuangan.vue` — acuan untuk halaman dengan tabel dan filter
4. `pages/wakaf.vue` — acuan untuk halaman dengan hero foto + profil + kartu

---

## Sebelum Mulai Mengerjakan

1. Baca `AI-CONTEXT.md` untuk memahami konteks penuh proyek
2. Baca file yang akan diedit terlebih dahulu
3. Konfirmasi ke pengguna jika ada yang ambigu sebelum mengubah kode
4. Jika perubahan menyentuh logika (bukan visual), **tanya dulu** sebelum mengerjakan

---

## Larangan Keras

- ❌ Jangan buat file Python, JavaScript, atau script apapun di luar `frontend/`
- ❌ Jangan jalankan perintah `npm install` tanpa izin
- ❌ Jangan ubah `.env` atau `.env.example`
- ❌ Jangan commit atau push ke git tanpa izin eksplisit
- ❌ Jangan hapus file apapun tanpa izin eksplisit
- ❌ Jangan ubah `AI-CONTEXT.md` atau `HANDOVER.md`
