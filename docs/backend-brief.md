# Brief Implementasi Backend PCM Berbah

**Tujuan:** Menjadi panduan kerja backend sampai API siap diintegrasikan dengan frontend Nuxt.

**Kontrak normatif:** [`docs/api-contract.md`](./api-contract.md)

**Stack target:** Express.js, MongoDB

**Bahasa aplikasi:** Indonesia

**Timezone bisnis:** `Asia/Jakarta`

Jika ada perbedaan antara contoh implementasi dalam dokumen ini dan kontrak API, `docs/api-contract.md` menjadi sumber utama untuk bentuk request/response.

## 1. Kondisi Frontend Saat Handover

- Seluruh halaman publik dan admin sudah tersedia.
- Login dan session masih mock di browser.
- User, transaksi keuangan, dan wakaf masih dipersist ke localStorage.
- Profil AUM masih hardcode; sebagian metadata belum tersedia.
- Upload foto wakaf masih simulasi.
- Role final hanya `admin` dan `superadmin`.
- Master final terdiri dari 12 unit, termasuk PCM Berbah.
- Frontend production build berhasil.
- Backend belum boleh mengandalkan pembatasan UI sebagai authorization.

## 2. Master AUM Final

Urutan berikut wajib dipertahankan:

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

Keputusan domain:

- `Klinik PKU Muhammadiyah Berbah` adalah satu unit gabungan.
- `PKU Muhammadiyah Berbah`, `Klinik PKU`, dan `Klinik Muhammadiyah` hanya nama legacy.
- Backend selalu menyimpan dan mengembalikan nama kanonis.
- Satu AUM boleh memiliki lebih dari satu akun admin.

## 3. Environment Variables

Nama boleh disesuaikan dengan standar repository backend, tetapi seluruh fungsi berikut harus tersedia.

```dotenv
NODE_ENV=development
PORT=3001
APP_TIMEZONE=Asia/Jakarta

MONGODB_URI=mongodb://127.0.0.1:27017/pcm_berbah

SESSION_COOKIE_NAME=pcm_session
SESSION_SECRET=ganti-dengan-secret-acak-minimal-32-byte
SESSION_TTL_SECONDS=28800
SESSION_REMEMBER_TTL_SECONDS=2592000

FRONTEND_ORIGINS=http://localhost:3000,https://pcmberbah.example

UPLOAD_DIR=/var/lib/pcm-berbah/uploads
UPLOAD_PUBLIC_BASE_URL=https://api.pcmberbah.example/uploads
UPLOAD_MAX_BYTES=5242880

LOGIN_MAX_ATTEMPTS=5
LOGIN_ATTEMPT_WINDOW_SECONDS=300
LOGIN_LOCK_SECONDS=900

BCRYPT_COST=12

SEED_CORE_SUPERADMIN_USERNAME=
SEED_CORE_SUPERADMIN_PASSWORD=
SEED_BACKUP_SUPERADMIN_USERNAME=
SEED_BACKUP_SUPERADMIN_PASSWORD=
```

Ketentuan env:

- Jangan memakai prefix `NUXT_PUBLIC_` untuk secret backend.
- Jangan commit file `.env` production.
- Jangan mencatat nilai password seed atau session secret ke log.
- Backend harus gagal start dengan pesan aman jika variable wajib production tidak tersedia.
- `SESSION_SECRET` harus dibuat dengan CSPRNG, bukan kalimat biasa.
- Password seed hanya dipakai saat akun belum ada, bukan untuk menimpa password yang telah diubah.

## 4. Koleksi Minimum

Nama koleksi tidak wajib sama, tetapi domain berikut perlu disimpan.

### 4.1 `aums`

Field minimum:

- `_id`
- `name`: unik, nama kanonis
- `slug`: unik
- `order`: unik, 1-12
- `hero`: URL nullable
- `profile`: string
- `info`: array empat item sesuai kontrak
- `created_at`, `updated_at`

Index:

- Unique `name`
- Unique `slug`
- Unique `order`

### 4.2 `users`

Field minimum:

- `_id`
- `username`
- `username_normalized`
- `password_hash`
- `role`: `admin` atau `superadmin`
- `aum_id`: wajib untuk admin, null untuk superadmin
- `is_core`: boolean
- `is_active`: boolean
- `created_at`, `updated_at`

Index dan invariant:

- Unique `username_normalized` agar username unik case-insensitive.
- Partial unique index `is_core=true` agar hanya ada satu akun inti.
- Admin wajib mempunyai AUM valid.
- Superadmin tidak mempunyai AUM.
- Hanya bootstrap/seed terkontrol yang boleh membuat superadmin.
- API users hanya membuat admin dan tidak boleh mengubah role/`is_core`.

### 4.3 `sessions`

Field minimum:

- `_id` atau hash session ID
- `user_id`
- `expires_at`
- `created_at`
- `last_seen_at`
- metadata audit seperlunya, misalnya hash IP dan user-agent yang sudah dibatasi

Index:

- TTL index pada `expires_at`.
- Index `user_id` untuk revoke seluruh session saat password berubah atau akun dihapus.

### 4.4 `login_attempts`

Gunakan Redis jika tersedia. Jika belum, MongoDB boleh digunakan dengan TTL index.

Field/logical key minimum:

- Kombinasi username normalized dan sumber request yang sudah dinormalisasi.
- Jumlah gagal.
- Awal window.
- `locked_until`.

Jangan memberi tahu client apakah username tertentu ada.

### 4.5 `transactions`

Field minimum mengikuti model `Transaction` dalam kontrak:

- `_id`
- `aum_id`
- `tanggal`: tipe date-only yang konsisten atau string `YYYY-MM-DD`
- `kode_akun`
- `tipe`, diturunkan dari CoA
- `nominal`: integer Rupiah
- `keterangan`
- `created_by`
- `diedit_oleh`, `diedit_pada`
- `created_at`, `updated_at`

Index yang disarankan:

- `{ aum_id: 1, tanggal: -1, created_at: -1 }`
- `{ aum_id: 1, tipe: 1, tanggal: -1 }`
- `{ kode_akun: 1, tanggal: -1 }`

### 4.6 `wakaf_assets`

Field minimum mengikuti model `WakafAsset`:

- `_id`
- `aum_id`
- `jenis_aset`
- `lokasi`
- `status`
- `nominal`
- `tanggal`
- `image`
- `keterangan`
- field pembuat/editor dan timestamp

Index yang disarankan:

- `{ aum_id: 1, tanggal: -1 }`
- `{ aum_id: 1, status: 1, tanggal: -1 }`

### 4.7 Chart of Accounts

Daftar CoA pada kontrak boleh disimpan sebagai konstanta terversi atau collection read-only. Backend wajib memvalidasi `kode_akun` dan menurunkan `tipe`/`kelompok` dari master tersebut.

## 5. Session dan Cookie

Frontend mengharapkan server-side session berbasis cookie HttpOnly.

Production cookie:

```text
pcm_session=<opaque-random-id>; HttpOnly; Secure; SameSite=Strict; Path=/
```

Implementasi wajib:

- Buat session ID dengan random kriptografis minimal 256 bit.
- Rotasi session saat login.
- Jangan memasukkan role, AUM, username, atau data sensitif sebagai sumber kebenaran di cookie.
- Jika memakai signed cookie, signature tidak menggantikan penyimpanan/revocation session server-side.
- `remember=false`: cookie sesi tanpa `Max-Age`.
- `remember=true`: maksimum 30 hari dan dapat direvoke.
- Revoke session saat logout.
- Revoke seluruh session user saat password berubah, password direset, akun dihapus, atau akun dinonaktifkan.
- `GET /api/auth/session` membaca user terbaru dari database sehingga perubahan role/status langsung berlaku.

## 6. CORS dan CSRF

Konfigurasi CORS:

- Allowlist berasal dari `FRONTEND_ORIGINS`.
- `credentials: true`.
- Jangan gunakan `Access-Control-Allow-Origin: *` bersama cookie.
- Izinkan method dan header yang benar-benar digunakan.
- Tambahkan `Vary: Origin` jika origin dinamis.

Proteksi mutasi:

- Dengan `SameSite=Strict`, tetap validasi header `Origin` untuk `POST`, `PATCH`, dan `DELETE`.
- Tolak origin yang hilang/tidak dikenal pada request browser production, dengan pengecualian eksplisit untuk client non-browser tepercaya jika memang dibutuhkan.
- Jika deployment berubah menjadi cross-site dan membutuhkan `SameSite=None`, implementasikan token CSRF sebelum integrasi.

## 7. Authorization Server-side

Gunakan middleware authentication lebih dahulu, lalu authorization per resource.

### Admin

- Session harus memiliki role admin dan AUM aktif.
- Laporan `GET /api/keuangan` bersifat publik untuk seluruh AUM dan bukan data rahasia.
- Dataset admin/export keuangan dibatasi ke AUM session.
- Tambah transaksi selalu menggunakan AUM session, walaupun body berisi AUM lain.
- Tidak boleh edit/hapus transaksi.
- Tidak boleh mengelola wakaf atau user.
- Boleh mengganti password sendiri.

### Superadmin

- Boleh membaca seluruh AUM.
- Boleh tambah/edit/hapus transaksi seluruh AUM.
- Boleh tambah/edit/hapus wakaf.
- Boleh mengelola admin.
- Superadmin backup tidak boleh mengelola akun inti atau dirinya sendiri.
- Superadmin inti dapat mengelola backup, tetapi tidak dapat mengelola dirinya melalui endpoint users.
- Akun inti tidak dapat diedit/dihapus melalui endpoint users oleh siapa pun.

Setiap query resource harus menerapkan scope AUM di database. Jangan mengambil seluruh data lalu hanya menyaring di response.

## 8. Password dan Login Protection

- Hash password menggunakan bcrypt dengan cost dari env; cost awal yang disarankan 12 dan harus diuji terhadap kapasitas server.
- Jangan memotong password diam-diam.
- Batasi panjang input login untuk mencegah abuse.
- Gunakan perbandingan hash yang aman.
- Respons kredensial salah selalu generik.
- Maksimal lima kegagalan dalam window lima menit, lalu lock 15 menit.
- Rate limit juga perlu diterapkan per IP/proxy source untuk mengurangi credential stuffing.
- Konfigurasi `trust proxy` Express hanya sesuai topologi reverse proxy sebenarnya.
- Jangan menyimpan password plaintext, termasuk di backup, log, fixture, atau audit trail.
- Seed superadmin harus meminta pergantian password awal jika proses operasional memungkinkan.

## 9. Validasi dan Sanitasi

- Gunakan schema validator pada body, params, dan query.
- Tolak object/field yang tidak dikenal pada endpoint sensitif agar privilege field tidak terselip.
- Trim string yang ditetapkan kontrak.
- Validasi integer nominal dan batas JavaScript safe integer.
- Validasi tanggal secara kalender, bukan regex saja.
- Tanggal transaksi/wakaf tidak boleh melewati hari ini dalam `Asia/Jakarta`.
- Escape output dilakukan frontend; backend tetap harus mencegah NoSQL injection dan operator injection.
- Jangan memakai body langsung sebagai update MongoDB.
- Validasi ObjectId sebelum query.

## 10. Upload Gambar

- Endpoint sesuai `POST /api/upload`.
- Hanya superadmin.
- Terima satu file maksimal 5 MB.
- JPEG, PNG, dan WebP saja.
- Periksa magic bytes.
- Buat nama acak server-side.
- Cegah path traversal.
- Simpan upload di volume persistent atau object storage, bukan direktori build/container ephemeral.
- Re-encode gambar dan hapus EXIF bila memungkinkan.
- Jangan izinkan SVG pada versi awal.
- URL hasil upload harus HTTPS di production dan dapat diakses frontend.
- Pertimbangkan cleanup file yatim secara periodik, bukan langsung menghapus file lama tanpa pemeriksaan referensi.

## 11. Response, Logging, dan Audit

- Gunakan envelope response pada kontrak.
- Tambahkan request ID ke response header dan structured log.
- Log method, route template, status, durasi, request ID, dan actor ID bila ada.
- Jangan log password, cookie, session ID, body login, atau URL upload privat.
- Catat audit mutasi penting: actor, resource, resource ID, action, timestamp, dan perubahan field non-sensitif.
- Jangan mengirim stack trace ke client.

## 12. Seed dan Migrasi Awal

Urutan seed yang disarankan:

1. Seed 12 master AUM secara idempotent berdasarkan slug.
2. Seed Chart of Accounts secara idempotent.
3. Buat satu superadmin inti dari secret deployment jika belum ada.
4. Buat satu superadmin backup jika variable tersedia dan akun belum ada.
5. Import profil AUM yang sudah tersedia.
6. Import data transaksi/wakaf hanya setelah pemilik proyek memastikan data tersebut nyata, bukan mock demonstrasi.

Catatan penting:

- Jangan mengimpor `frontend/.env` sebagai database production.
- Jangan mengimpor password mock `admin123` ke production.
- Data `INITIAL_DATA` frontend tampak seperti data contoh dan harus dianggap mock sampai dikonfirmasi.
- Field profil bernilai `-` harus menjadi `null` di database/API.
- Jangan menimpa data production saat seed dijalankan ulang.

## 13. Urutan Implementasi

1. Setup Express, config validation, MongoDB connection, error handler, request ID, dan security middleware.
2. Seed master AUM dan Chart of Accounts.
3. Implementasi users internal, bcrypt, session store, login protection, dan endpoint auth.
4. Implementasi authorization middleware dan integration tests role/AUM.
5. Implementasi endpoint keuangan beserta pagination/filter.
6. Implementasi endpoint wakaf.
7. Implementasi upload.
8. Implementasi endpoint profil AUM publik.
9. Jalankan security/integration tests.
10. Deploy staging dan serahkan base URL serta akun staging kepada frontend melalui kanal aman.

## 14. Pengujian Minimum Backend

### Auth

- Login benar dan salah.
- Tidak ada user enumeration.
- Lock setelah lima kegagalan dan pulih setelah masa lock.
- Cookie memiliki flag yang benar.
- Session rotation dan expiry.
- Logout idempotent.
- Ganti password merevoke seluruh session.
- User nonaktif tidak dapat memakai session lama.

### Authorization

- Admin tidak dapat membaca dataset admin/export AUM lain dengan mengubah query; endpoint laporan publik tetap dapat dibaca seluruh pengunjung.
- Admin tidak dapat menulis transaksi ke AUM lain dengan mengubah body.
- Admin mendapat 403 pada edit/hapus keuangan, wakaf, dan users.
- Superadmin backup tidak dapat mengubah core/self.
- Core dapat mengelola backup tetapi tidak dirinya lewat endpoint users.
- Tidak ada mass assignment untuk `role`, `is_core`, field audit, atau AUM terlarang.

### Keuangan

- Validasi CoA dan derivasi tipe.
- Nominal nol, negatif, pecahan, terlalu besar.
- Tanggal invalid dan masa depan.
- Semua mode periode dan boundary tanggal.
- Pagination stabil tanpa record hilang/duplikat.
- Ringkasan dan kategori dihitung dari seluruh filter, bukan hanya satu page.
- Dataset export lengkap, dibatasi AUM sesuai session, rentang, dan batas record.

### Wakaf dan Upload

- Validasi status dan field wajib.
- Ringkasan wakaf dihitung dari seluruh filter, bukan hanya satu page.
- Upload file palsu, MIME salah, file terlalu besar, dan nama berbahaya ditolak.
- File valid menghasilkan URL yang dapat diakses.
- Penghapusan resource tidak menghapus file yang masih direferensikan.

### Contract

- Seluruh response mengikuti envelope.
- Error tidak mengandung stack trace/secret.
- Semua ID string, tanggal `YYYY-MM-DD`, timestamp UTC ISO.
- Master AUM tepat 12 dan urutannya benar.

## 15. Acceptance Criteria Backend

Backend siap diserahkan kembali ke frontend jika:

- Seluruh endpoint pada `docs/api-contract.md` tersedia di staging.
- OpenAPI/Postman collection sesuai implementasi aktual disediakan.
- Database migration/seed idempotent tersedia.
- Semua test minimum lulus.
- CORS staging mengizinkan domain frontend staging dengan credentials.
- Cookie session terlihat HttpOnly dan tidak dapat dibaca JavaScript.
- Tidak ada bearer token/password di localStorage.
- Data bertahan setelah restart.
- Backup dan prosedur restore MongoDB telah diuji.
- Upload memakai storage persistent.
- Rate limiting tetap benar saat aplikasi berada di belakang reverse proxy.
- Backend memberi frontend base URL, daftar error code final, dan kredensial staging melalui kanal aman.

## 16. Perubahan Frontend Setelah API Siap

Frontend akan melakukan Tahap 4 pada file berikut:

- `frontend/composables/useAuth.ts`: login/logout/session/change-password menjadi request API.
- `frontend/composables/useUsers.ts`: hapus seed env dan persistence localStorage; gunakan CRUD API.
- `frontend/composables/useKeuangan.ts`: pertahankan helper presentasi/export bila perlu, tetapi data dan CRUD berasal dari API.
- `frontend/composables/useWakaf.ts`: data dan CRUD berasal dari API.
- `frontend/composables/useAumProfiles.ts`: profil berasal dari API; master `useAum.ts` dapat tetap menjadi fallback/urutan kanonis.
- `frontend/middleware/auth.ts`: validasi session server, bukan localStorage.
- `frontend/pages/admin/wakaf.vue`: tombol simulasi diganti upload `multipart/form-data`.
- `frontend/.env`: hapus `NUXT_PUBLIC_USERS`; sisakan base URL API non-secret.
- `frontend/nuxt.config.ts`: sesuaikan CSP `connect-src` dan `img-src` dengan domain API/upload production.

## 17. Hal yang Harus Dikonfirmasi Pemilik Data

Backend dapat dibangun tanpa menunggu poin ini, tetapi production content membutuhkan:

- Tahun berdiri PCM Berbah.
- Email SD Muhammadiyah Pajangan 1 dan Pajangan 2.
- Tahun berdiri dan email SD Muhammadiyah Noyokerten.
- Tahun berdiri SD Muhammadiyah Semoya.
- Tahun berdiri, alamat, dan email SD Muhammadiyah Bulu.
- Email SMK Muhammadiyah Berbah.
- Tahun berdiri, alamat, dan email Klinik PKU Muhammadiyah Berbah.
- Nama resmi, tahun berdiri, alamat, dan email Lazismu Berbah.
- Nama resmi, tahun berdiri, alamat, dan email unit Masjid.
- Foto resmi masing-masing AUM.
- Konfirmasi bahwa transaksi dan wakaf yang akan diimpor adalah data nyata, bukan fixture demo.
