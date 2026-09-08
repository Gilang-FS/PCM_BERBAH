# Frontend PCM Berbah

Frontend Sistem Informasi PCM Berbah menggunakan Nuxt 4, Vue 3, dan Tailwind CSS.

## Status Saat Ini

- UI halaman publik dan admin sudah selesai dan telah melalui audit awal responsivitas, aksesibilitas, data mock, serta kebersihan kode.
- Production build terakhir berhasil.
- Autentikasi, pengguna, transaksi keuangan, dan aset wakaf masih berupa simulasi frontend dengan `localStorage`.
- Foto AUM dan aset wakaf yang belum resmi sengaja menggunakan materi placeholder/Unsplash untuk kebutuhan demo.
- Foto demo tidak perlu diganti sebelum handover. Backend nantinya menyediakan URL foto resmi melalui API/upload.

## Keputusan Finalisasi

Pada sesi berikutnya, lanjutkan langsung dengan **final clearance frontend untuk handover backend**. Jangan melakukan redesign baru, mengganti foto demo, menambah data palsu, atau memperluas fitur mock yang nantinya akan digantikan backend.

Prioritas final clearance:

1. Uji seluruh halaman publik dan admin pada mobile, tablet, dan desktop.
2. Uji refresh langsung serta navigasi antarrute untuk memastikan layout konsisten.
3. Selesaikan aksesibilitas modal dan sidebar yang masih tersisa, terutama focus trap, focus return, Escape, dan scroll lock.
4. Uji alur login, logout, role guard, CRUD pengguna, CRUD keuangan, CRUD wakaf, perubahan password, persistence `localStorage`, serta export Excel/PDF.
5. Bersihkan kode debug/kode mati yang aman dihapus tanpa mengubah perilaku.
6. Jalankan pemeriksaan akhir dan production build.
7. Setelah frontend dinyatakan stabil, lanjutkan ke API contract dan dokumen handover backend sesuai `HANDOVER.md` di root proyek.

## Halaman Yang Wajib Diuji

Halaman publik:

- `/`
- `/wakaf`
- `/keuangan`
- `/struktur`
- `/login`

Halaman admin:

- `/admin/dashboard`
- `/admin/keuangan`
- `/admin/wakaf`
- `/admin/users`
- `/admin/profil`
- `/admin/forbidden`

## Role Dan Akses

Role hanya terdiri dari:

- `admin`: mengakses data keuangan AUM sendiri dan menambah transaksi untuk AUM sendiri.
- `superadmin`: memilih AUM, mengelola transaksi, Wakaf, dan akun pengguna.

Halaman Wakaf dan Pengguna hanya dapat dikelola superadmin. Admin yang membuka rute tersebut diarahkan ke `/admin/forbidden`.

## Catatan Data Demo

- AUM yang belum memiliki transaksi atau aset boleh menampilkan empty state. Jangan mengisi data palsu hanya agar halaman terlihat penuh.
- Metadata AUM yang masih bernilai `-` adalah data yang belum tersedia dan telah ditandai `TODO(API)` di `composables/useAumProfiles.ts`.
- URL Unsplash masih diperbolehkan untuk demo.
- Upload foto Wakaf masih berupa simulasi. Integrasi final menggunakan endpoint upload backend.
- Seed akun berasal dari `NUXT_PUBLIC_USERS` dan hanya boleh digunakan untuk demo lokal.

## Batas Keamanan Mock

Implementasi saat ini tidak boleh dianggap aman untuk produksi:

- Password mock tersedia di browser.
- Session dan role disimpan di `localStorage`.
- Otorisasi hanya berjalan di frontend.
- Data CRUD disimpan di `localStorage`.

Backend wajib menggantinya dengan password hashing, session cookie `HttpOnly`, server-side authorization, validasi server, rate limiting, dan database.

## Integrasi Backend Yang Diharapkan

Setelah API tersedia, bagian berikut harus dimigrasikan:

- `composables/useAuth.ts`: login, logout, dan session ke API.
- `composables/useKeuangan.ts`: data dan CRUD keuangan ke API.
- `composables/useWakaf.ts`: data, CRUD, dan upload foto ke API.
- `composables/useUsers.ts`: data dan CRUD pengguna ke API.
- `composables/useAumProfiles.ts`: profil dan foto AUM dari API.
- `middleware/auth.ts`: validasi session server, bukan nilai role dari browser.
- `NUXT_PUBLIC_USERS`: dihapus setelah backend autentikasi tersedia.

## Menjalankan Proyek

Install dependency:

```bash
npm install
```

Development server:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Kriteria Siap Handover

Frontend dianggap siap diserahkan ke backend jika:

- Tidak ada overflow atau layout rusak pada viewport utama.
- Semua modal dan menu dapat digunakan dengan mouse dan keyboard.
- Role admin dan superadmin mengikuti aturan akses.
- CRUD dan persistence mock lolos pengujian.
- Export Excel/PDF berhasil dan error ditangani.
- Tidak ada `console.log`, `debugger`, atau error build.
- `npm run build` selesai tanpa error.
- API contract mencerminkan struktur data frontend final.

Dokumen acuan utama tetap `GEMINI.md`, `AI-CONTEXT.md`, dan `HANDOVER.md` di root proyek.
