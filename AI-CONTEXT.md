# Dokumentasi Konteks Pengerjaan Frontend PCM Berbah

> **Dokumen terkait:**
> - `GEMINI.md` — aturan dan batasan kerja untuk AI (wajib dibaca sebelum mengerjakan apapun)
> - `HANDOVER.md` — panduan tahap finalisasi dan serah terima ke backend setelah UI/UX selesai

## 1. Identitas dan Batas Pengerjaan
* **Proyek:** Sistem Informasi Keuangan, Wakaf, Keanggotaan, dan Profil PCM Berbah.
* **Peran Kita:** Frontend Developer.
* **Tech Stack:** Nuxt 4 (Vue 3), Tailwind CSS.
* **Batas Tugas:**
  * Hanya memodifikasi kode di direktori `frontend/`.
  * Tidak membangun backend (Express), database (MongoDB), hashing password, atau session server.
  * Menyiapkan frontend yang tangguh, role-aware, aksesibel, dan *integration-ready* sebelum API tersedia.
  * Tetap mempertahankan gaya visual "institusi Muhammadiyah" (`muhammadiyah.or.id`) untuk halaman publik, dan gaya modern untuk area admin.
  * Perbaikan visual detail (redesign) dilakukan paling akhir, setelah fungsi halaman stabil.
* **Data Mock:** `NUXT_PUBLIC_USERS` dari `frontend/.env` menjadi seed awal akun. Login dan CRUD pengguna membaca store terpusat `useUsers`, lalu perubahan dipersist ke `localStorage`. CRUD keuangan dan wakaf juga memakai store terpusat berbasis `localStorage`.

### Master Unit / AUM
Urutan resmi `AUM_LIST` saat ini:
1. PCM Berbah
2. SD Muhammadiyah Karangharjo
3. SD Muhammadiyah Pajangan 1
4. SD Muhammadiyah Pajangan 2
5. SD Muhammadiyah Noyokerten
6. SD Muhammadiyah Semoya
7. SD Muhammadiyah Bulu
8. SMP Muhammadiyah 1 Berbah
9. SMK Muhammadiyah Berbah
10. Klinik PKU Muhammadiyah Berbah
11. Lazismu Berbah
12. Masjid

* `PCM Berbah` wajib menjadi opsi pertama.
* `Klinik PKU Muhammadiyah Berbah` adalah satu unit gabungan. Nama `PKU Muhammadiyah Berbah`, `Klinik PKU`, dan `Klinik Muhammadiyah` diperlakukan sebagai nama legacy untuk unit tersebut.
* `Lazismu Berbah` adalah unit resmi ke-11.
* `normalizeAumName` memigrasikan nama AUM lama pada session/store `localStorage` ke nama resmi baru agar data mock yang sudah tersimpan tidak langsung hilang.

## 2. Aturan Akses (Role & Permission)
Role yang tersedia dalam sistem hanya ada dua: `admin` dan `superadmin`.

| Fitur / Halaman | Akses Admin | Akses Superadmin |
| :--- | :--- | :--- |
| **Login / Logout** | Ya | Ya |
| **Dashboard** | Ya (Hanya data AUM sendiri) | Ya (Bisa memilih/filter AUM) |
| **Keuangan (Lihat)** | Area admin hanya data AUM sendiri; laporan publik tetap terbuka untuk semua AUM | Ya (Bisa memilih/filter AUM) |
| **Keuangan (Tambah)** | Ya (Hanya ke AUM sendiri) | Ya |
| **Keuangan (Edit/Hapus)**| Tidak | Ya |
| **Wakaf (Kelola)** | Tidak | Ya |
| **Pengguna (Kelola)** | Tidak | Ya |
| **Profil (Ubah PW)** | Ya | Ya |
| **Struktur Organisasi** | Tidak ada akses CRUD admin, halaman statis saja | Tidak ada akses CRUD admin, halaman statis saja |

* **Route Guard Frontend:** Route divalidasi menggunakan middleware. Admin yang mengakses route superadmin akan diarahkan ke `/admin/forbidden`.
* **Jumlah Superadmin:** Direncanakan dua akun: satu superadmin inti dan satu superadmin backup. Keduanya hanya didaftarkan melalui `NUXT_PUBLIC_USERS`, bukan dibuat melalui UI.
* **Superadmin Inti:** Entri superadmin pertama pada `NUXT_PUBLIC_USERS` ditetapkan sebagai akun inti. Akun ini tidak dapat diedit atau dihapus dari halaman Pengguna oleh siapa pun; perubahan password sendiri dilakukan melalui halaman Profil.
* **Superadmin Backup:** Dapat mengelola akun admin, tetapi tidak dapat mengelola akun inti atau akunnya sendiri dari halaman Pengguna. Superadmin inti dapat mengedit/reset password atau menghapus akun backup.
* **Pembuatan Akun UI:** Halaman Pengguna hanya dapat membuat akun dengan role `admin`. Role akun yang sudah ada tidak dapat diubah melalui UI.

## 3. Status Pengerjaan (Tahap yang Sudah Selesai)

### ✅ Halaman Login (`/login`)
* Mencegah submit ganda (menghapus listener Enter paralel).
* Mengubah rule validasi frontend hanya mengecek kekosongan field.
* Menjadikan pesan error internal tidak tampil mentah.
* Perbaikan aksesibilitas (aria-attributes untuk bantuan, hide/show password, label).
* Fitur redirect otomatis ke intended URL setelah login.

### ✅ Autentikasi & State Frontend (`useAuth`)
* Membuat `auth_role`, `auth_username`, dan `auth_aum` sebagai *single source of truth*.
* Logout membersihkan semua state frontend dan memanggil `router.replace()`.
* Rate-limiting mock: lockout setelah 5 kali gagal.
* Menerapkan middleware berbasis role (`admin` & `superadmin`).

### ✅ Dashboard & Export Keuangan
* Memisahkan AUM admin (`effectiveAum`) dari AUM pilihan superadmin. Admin tidak lagi dipaksa ke "SD Muhammadiyah 1".
* Memperbaiki perhitungan surplus/defisit (tidak lagi disebut sisa saldo, karena hanya menghitung pemasukan - pengeluaran periode berjalan).
* Memperbaiki agregasi kategori dan chart (chart area tidak lagi membuat titik palsu/nol jika kosong, mengelompokkan dengan presisi tanggal untuk bulanan).
* Mencegah double-click pada tombol Export (Excel & PDF).
* Menangani error export dengan try/catch dan toast.
* Menambahkan label periode yang sesuai rentang filter kalender.
* Menghapus preview "Wakaf Terbaru" untuk sementara karena menggunakan dummy yang tidak terhubung dengan data sebenarnya.

### ✅ Halaman Keuangan (`/admin/keuangan`)
* Normalisasi data (`useKeuangan.ts`): memastikan nominal `> 0`, kategori sesuai tipe transaksi, format kalender `YYYY-MM-DD` valid, AUM terdaftar di master list.
* Menghapus ketergantungan pada dummy cross-role: form admin memaksakan AUM akun; edit form superadmin mempertahankan AUM bawaan transaksi.
* Melengkapi CRUD keuangan dengan `try/catch`, return boolean, rollback state `localStorage` saat gagal, dan memicu Toast sukses/error.
* Memperbaiki semantik modal (dialog): penguncian fokus, trapping esc-key, `aria-label`, scroll-lock latar, serta pengembalian fokus ke pemicu aksi.
* Membuang event listener *outside-click* yang bocor di `onBeforeUnmount`.

### ✅ Layout & Struktur
* Menambahkan halaman `403 Forbidden` (`/admin/forbidden`).
* Menghapus halaman CRUD `/admin/struktur` karena diputuskan bahwa pengelolaan struktur hanya melalui source code (statis), dan tidak tampil di sidebar admin.
* Layout menampilkan username, AUM, dan label role dari state sesi mock.

### ✅ Halaman Wakaf (`/admin/wakaf`)
* Memindahkan data wakaf dari state lokal komponen ke store tersentralisasi `composables/useWakaf.ts` (singleton module-level ref, pola sama dengan `useKeuangan`).
* Persistence `localStorage` (key `pcm_berbah_wakaf_data`) dengan normalisasi saat load: data invalid per-item dibuang, fallback ke data awal bila rusak total.
* Menyamakan daftar AUM wakaf dengan master `AUM_LIST` (field `aum`); filter unit mengikuti pilihan global superadmin (`activeAum` dari `useAum`).
* Normalisasi & validasi: `jenis_aset` & `lokasi` wajib terisi, `status` hanya `Aktif`/`Proses`, `nominal` angka >= 0, `tanggal` format `YYYY-MM-DD` valid, AUM harus terdaftar di master list.
* CRUD wakaf (`tambahWakaf`/`editWakaf`/`hapusWakaf`) memakai `try/catch`, return boolean, rollback state saat gagal, dan memicu Toast sukses/error di halaman.
* Memasang field tanggal nyata (`tanggal` = tanggal pendataan aset) pada data awal, form (maks. hari ini), dan kartu aset.
* Modal form & konfirmasi hapus dijadikan *accessible dialog*: `role="dialog"`, `aria-modal`, `aria-labelledby`, tutup dengan Esc, fokus awal ke field pertama/dialog, pengembalian fokus ke tombol pemicu, scroll-lock latar (dibersihkan di `onBeforeUnmount`), `aria-label` pada tombol aksi, dan guard submit/delete ganda.
* Area upload foto diubah menjadi elemen `button` agar dapat diakses keyboard (upload tetap simulasi sampai backend tersedia).

### ✅ Halaman Pengguna (`/admin/users`) & Store Pengguna (`useUsers`)
* Memindahkan data pengguna ke store terpusat `composables/useUsers.ts`: seed awal dari `NUXT_PUBLIC_USERS`, lalu perubahan CRUD disimpan dalam `localStorage` (key `pcm_berbah_users_data`).
* Menghubungkan `useAuth.login()` ke store pengguna sehingga akun admin yang dibuat/diedit lewat UI dapat dipakai login pada tahap mock.
* Menormalisasi username, password, role, dan AUM; akun admin wajib memakai AUM yang terdaftar di `AUM_LIST`.
* Menegakkan aturan superadmin inti/backup pada UI dan CRUD store, bukan hanya menyembunyikan tombol aksi.
* Superadmin inti ditentukan dari entri superadmin pertama di env dan diberi penanda `is_core`; akun inti tidak dapat diedit/dihapus dari halaman Pengguna.
* Superadmin backup hanya dapat dikelola oleh superadmin inti. Semua superadmin dapat mengelola akun admin, tetapi tidak dapat mengelola akun sendiri dari halaman Pengguna.
* Pembuatan akun dari UI dipaksa ber-role `admin`; promosi/perubahan role melalui UI dihapus.
* CRUD memakai validasi duplikasi username, password minimal 6 karakter, konfirmasi password, AUM valid, `try/catch`, rollback, return boolean, dan Toast sukses/error.
* Modal tambah/edit/hapus dilengkapi semantik dialog, Esc, fokus awal/pengembalian fokus, scroll-lock, label form, dan guard submit/hapus ganda.

### ✅ Halaman Profil (`/admin/profil`)
* Validasi password lama membaca akun aktif dari store pengguna.
* Perubahan password menggunakan operasi store `ubahPasswordSendiri`/`gantiPassword` sehingga tersimpan di `localStorage` dan langsung dipakai alur login berikutnya.
* Setelah password berhasil diubah, sesi dibersihkan dan pengguna diarahkan login ulang.

### ✅ Pembaruan Master AUM
* Mengganti master menjadi `PCM Berbah` + 11 AUM resmi pada `composables/useAum.ts`.
* Menyinkronkan seed akun env, data awal keuangan, data awal wakaf, default filter publik, dan AUM sesi autentikasi ke nama resmi.
* Menambahkan migrasi kompatibilitas nama lama melalui `normalizeAumName` untuk data keuangan, wakaf, pengguna, dan sesi admin yang sudah tersimpan.
* Production build Nuxt berhasil setelah sinkronisasi AUM dan pengelolaan pengguna.
* Menetapkan `Klinik PKU Muhammadiyah Berbah` sebagai satu unit gabungan dan menambahkan `Lazismu Berbah`, sehingga total master final adalah 12 unit termasuk PCM Berbah.

### ✅ Halaman Publik Profil AUM & Wakaf (`/wakaf`) — Redesign Selesai
* Hero diubah menjadi foto landscape pendek (`h-64/72/80`) dengan gradient dari bawah dan teks judul (nama AUM) di dalam foto — berbeda dari hero fullscreen Beranda.
* Dropdown "Pilih unit / AUM" ditempatkan di bilah kontrol terpisah di bawah foto hero (background `#f0eee7`).
* Bagian profil menggunakan grid **2:1** (`lg:grid-cols-3`): kolom kiri (`col-span-2`) berisi Profil Singkat, kolom kanan (`col-span-1`) berisi kotak "Informasi Unit".
* **Visi & Misi dihapus** dari halaman publik Wakaf — diganti dengan "Informasi Unit" yang berisi: Nama Resmi, Tahun Berdiri, Alamat, Email dalam format teks `Label : Value` di dalam kotak bergaris.
* Banner hijau dikembalikan namun **tidak full ujung ke ujung** — dibungkus `px-6 md:px-10 lg:px-14` sehingga punya margin horizontal dan `rounded-[10px]`. Ornamen masjid dipertahankan, garis aksen vertikal dihapus.
* Grid kartu aset maksimal **3 kolom** (`lg:grid-cols-3`), bukan 4.
* Empty state disederhanakan: hanya satu kalimat teks tanpa ikon SVG gedung.
* Data profil `useAumProfiles.ts` diubah strukturnya: field `vision` dan `missions` diganti dengan `info` (array `{ label, value }`). Data nyata diisi untuk unit yang ditemukan (SD Karangharjo, SD Semoya, SMP Muh 1 Berbah), sisanya diisi `-` sebagai placeholder.
* Profil resmi SD Muhammadiyah Karangharjo sudah diperbarui dengan teks resmi dari pihak sekolah.
* Production build Nuxt berhasil setelah redesign halaman publik wakaf.

### ✅ Arah UI/UX Publik & Revisi Beranda (`/`)
* Arah visual publik diputuskan tetap formal dan institusional, tidak menggunakan banyak kartu, bayangan, sudut sangat bulat, ikon dekoratif, atau pola dashboard modern yang membuat halaman terasa seperti template generatif.
* Tipografi isi publik menggunakan `Lato`; judul section menggunakan `Montserrat` ExtraBold/Bold, sedangkan serif (`Georgia`/`Times New Roman`) dipertahankan khusus untuk judul hero dan kutipan visi agar hierarki tetap formal.
* Beranda menggunakan layout khusus `layouts/home.vue`. Navbar, latar halaman, dan footer tetap sama, tetapi hero dan bingkai konten dapat diatur secara independen dari `layouts/default.vue`.
* Hero slider Beranda menjadi panel foto terpisah dari boxed layout konten di bawahnya. Hero dan kotak konten tetap sejajar dengan lebar maksimal `76rem` serta margin horizontal total `3.5rem` pada mobile, `5.5rem` pada tablet, dan `7.5rem` pada desktop.
* Hero memiliki tinggi responsif `430px`/`500px`/`600px`, radius tipis `10px`, judul di kiri bawah, garis aksen hijau Muhammadiyah, dan indikator slide vertikal di sisi kanan.
* Overlay hijau penuh pada hero Beranda dihapus. Sebagai gantinya digunakan gradasi hitam dari kiri dan bawah agar identitas serta detail foto tetap terlihat, tetapi teks tetap terbaca.
* Setiap slide memiliki teks alternatif yang spesifik. Tombol indikator dilengkapi `aria-label`, `aria-current`, dan focus ring.
* Seluruh bagian informasi Beranda di bawah hero tetap berada dalam satu boxed layout putih formal. Konten internal tidak dipecah menjadi kartu-kartu individual; pemisah section memakai ruang kosong, garis tipis yang tidak menyentuh tepi kotak, dan hierarki tipografi.
* Urutan isi Beranda saat ini: Profil Singkat + Visi-Misi, Sambutan Ketua, Gerak dan Pengabdian PCM Berbah, lalu Informasi Kontak dan peta.
* Profil Singkat dan Visi-Misi ditempatkan berdampingan pada desktop serta bertumpuk pada mobile. Label dekoratif kecil di atas judul dihapus; setiap judul section memakai garis aksen hijau sepanjang 40% lebar judul.
* Bagian Gerak dan Pengabdian menggunakan grid 2x2 pada tablet/desktop dan satu kolom pada mobile. Setiap bidang memiliki placeholder foto rasio 16:9 dengan radius `10px`, nomor `01`-`04`, subjudul, garis hijau, dan deskripsi.
* Navbar publik memakai teks menu `16px`, area klik yang lega, indikator aktif dekat label, tombol Login `16px` dengan padding ringkas, serta background putih 95% dan backdrop blur ringan.
* Footer memakai tiga kolom `5:3:4` (identitas, menu cepat, kontak), alamat lengkap, menu Wakaf, dan copyright rata kiri. Warna hijau lama dipertahankan.
* Peta Beranda menggunakan iframe Google Maps berdasarkan listing `Kantor PCM Berbah (Muhammadiyah Berbah)`, tanpa API key dan tanpa kontrol Peta/Satelit kustom.
* Production build Nuxt berhasil setelah finalisasi Beranda. Slider berhenti ketika tab browser tidak terlihat dan berjalan kembali saat tab aktif.

### ✅ Penyelarasan Halaman Publik Lain
* Beranda ditetapkan sebagai acuan sistem visual untuk Wakaf, Keuangan, dan Struktur tanpa menyeragamkan karakter kontennya.
* Padding section publik diseragamkan: horizontal `24px` mobile, `40px` tablet, `56px` desktop; vertikal `48px`, `56px`, dan `64px`.
* Radius elemen utama non-tabel diseragamkan menjadi `10px`. Tabel Keuangan dan Struktur tetap bersudut siku agar formal.
* Header tabel publik menggunakan abu-abu arang `#303030`; tabel dilengkapi caption untuk screen reader dan `scope="col"` pada header kolom.
* Keuangan mempertahankan hero laporan, panel ringkasan kas, bilah filter, dan tabel transaksi. Bilah filter dipisahkan dari tabel dengan jarak agar hierarki kontrol dan data jelas; tombol periode aktif memakai abu-abu arang.
* Wakaf mempertahankan hero foto landscape pendek, bilah pemilih AUM, grid profil+informasi unit (2:1), banner hijau bermargin, ringkasan aset, dan kartu aset (maks. 3 kolom).
* Struktur mempertahankan kolase foto, banner hijau berornamen, tabel desktop, dan daftar mobile.
* Data resmi yang sudah diperbarui: visi dan delapan misi SD Muhammadiyah Pajangan 2; visi dan tujuh misi SMP Muhammadiyah 1 Berbah. Profil/foto resmi AUM lain masih menunggu materi.

### ✅ Hardening Frontend, Aksesibilitas, dan Performa
* Middleware autentikasi kini memeriksa `auth_token` dan `auth_role` dari key resmi; key sesi legacy/duplikat (`user_role`, `user_username`, `user_aum`, `remember_login`) sudah dihapus.
* Proteksi lima percobaan login dan waktu lockout disimpan secara lokal sehingga tidak hilang hanya karena refresh browser.
* Menambahkan security headers global: CSP, Referrer-Policy, Permissions-Policy, X-Content-Type-Options, dan X-Frame-Options; route admin tetap `no-store` dan menolak framing.
* CSP mengizinkan resource yang memang digunakan saat ini: Google Fonts, iframe Google Maps, gambar Unsplash, dan API development lokal.
* URL gambar Wakaf dinormalisasi: hanya path lokal atau URL HTTPS yang diterima; URL invalid/protokol lain memakai fallback.
* `ExcelJS`, `jsPDF`, dan `jspdf-autotable` dimuat dinamis saat export dijalankan, bukan dalam bundle awal. Ukuran output server build turun dari sekitar `9.1 MB` menjadi `2.77 MB`.
* Utility format dipindah dari `utils/format.js` ke `utils/format.ts` dengan tipe input/return eksplisit; font eksternal yang tidak digunakan dihapus.
* Menambahkan relasi label-input pada form Profil, status ARIA dinamis pada hamburger, dimensi eksplisit pada gambar penting, dan lazy-loading untuk gambar non-kritis.
* Tombol simpan edit Keuangan Admin diselaraskan ke hijau Muhammadiyah.
* Audit Tahap 1 menambahkan perbaikan overflow/wrapping, state disabled, modal pada viewport pendek, skip link, focus containment, return focus setelah delete, `aria-current`, dan toast yang dapat dijeda/ditutup.
* URL Unsplash pada hero profil AUM telah diganti dengan placeholder lokal yang tersedia; URL mock aset wakaf masih dipertahankan sampai materi aset tersedia.
* Production build berhasil setelah finalisasi Tahap 1 dan penambahan Lazismu Berbah.

### ✅ Dokumen Handover Backend
* Kontrak API final tersedia di `docs/api-contract.md`, mencakup session cookie HttpOnly, request/response, validasi, pagination, filter, authorization, upload, dan error code.
* Brief implementasi backend tersedia di `docs/backend-brief.md`, mencakup env, schema minimum, seed, keamanan, urutan implementasi, pengujian, dan acceptance criteria.

### ⚠️ Batas Keamanan Tahap Mock
* Selama autentikasi masih frontend-only, `NUXT_PUBLIC_USERS` dan password mock tetap tersedia di browser serta perubahan pengguna tetap tersimpan di `localStorage` dalam bentuk plaintext.
* Hashing password di frontend tidak dianggap solusi karena hash tetap menjadi kredensial yang dapat disalin. Perbaikan final wajib dilakukan di backend: password hashing, session/cookie HttpOnly, server-side authorization, rate limiting server, dan persistence database.

## 4. Dokumen Pendukung

* `GEMINI.md` — aturan dan batasan kerja untuk AI lain (Gemini, dll). Wajib dibaca AI sebelum mengerjakan apapun di proyek ini.
* `HANDOVER.md` — panduan lengkap tahap finalisasi frontend dan serah terima ke backend setelah UI/UX selesai.
* `docs/api-contract.md` — kontrak request, response, validasi, authorization, dan error code backend.
* `docs/backend-brief.md` — panduan implementasi, keamanan, pengujian, dan acceptance criteria backend.

## 5. Tahap Selanjutnya (To-Do List Saat Ini)

1. **Finalisasi UI/UX dan Quality Assurance**
   * ✅ Halaman publik `/wakaf` — redesign selesai.
   * ✅ Halaman publik `/keuangan` — diselaraskan dengan sistem visual Beranda.
   * ✅ Halaman publik `/struktur` — diselaraskan dengan sistem visual Beranda.
   * ✅ Audit statis responsif dan aksesibilitas semua halaman publik/admin selesai.
   * 🔲 Smoke test browser desktop, tablet, dan mobile pada perangkat/browser target.
   * 🔲 Ganti empat placeholder foto Gerak dan Pengabdian dengan materi resmi.
   * 🔲 Lengkapi data `info` (Alamat, Tahun Berdiri, Email) tiap AUM di `useAumProfiles.ts` dengan data resmi.
   * ✅ Ganti foto hero Unsplash dengan placeholder lokal.
   * 🔲 Ganti placeholder lokal dengan foto asli tiap AUM saat materi tersedia.
   * 🔲 Uji alur login, logout, role guard, CRUD pengguna/keuangan/wakaf, pergantian password, persistence localStorage, serta export Excel/PDF.

2. **Integrasi Backend untuk Keamanan Final**
   * Pindahkan autentikasi, akun, hashing password, session HttpOnly, authorization, rate limiting, upload gambar, dan persistence data ke backend/database.
   * Hapus `NUXT_PUBLIC_USERS` dan penyimpanan password dari browser setelah endpoint autentikasi tersedia.
   * Panduan implementasi ada di `docs/backend-brief.md`; kontrak endpoint ada di `docs/api-contract.md`.

3. **Pembuatan API Contract Final**
   * ✅ `docs/api-contract.md` telah difinalkan sesuai struktur object dan logic sistem.
   * ✅ `docs/backend-brief.md` telah dibuat untuk tim backend.
