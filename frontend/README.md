# Frontend PCM Berbah

Aplikasi frontend Sistem Informasi PCM Berbah menggunakan Nuxt 4, Vue 3, dan Tailwind CSS.

## Menjalankan Aplikasi

```bash
npm install
cp .env.example .env
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Halaman

Publik:

- `/`
- `/wakaf`
- `/keuangan`
- `/struktur`
- `/login`

Admin:

- `/admin/dashboard`
- `/admin/keuangan`
- `/admin/wakaf`
- `/admin/users`
- `/admin/profil`
- `/admin/forbidden`

## Status Integrasi

Autentikasi, pengguna, transaksi keuangan, dan aset wakaf masih menggunakan mock/localStorage. Implementasi tersebut hanya untuk demonstrasi dan harus diganti dengan API sebelum production.

Kontrak integrasi dan panduan backend berada di:

- [`../docs/api-contract.md`](../docs/api-contract.md)
- [`../docs/backend-brief.md`](../docs/backend-brief.md)

## Keamanan

- Jangan commit `.env` atau `.env.local`.
- Jangan menaruh secret pada variable `NUXT_PUBLIC_*`.
- Jangan memakai akun, password, transaksi, atau wakaf mock sebagai data production.
- Setelah backend siap, gunakan session cookie HttpOnly dan authorization server-side.

Informasi proyek dan alur kolaborasi tersedia pada [`../README.md`](../README.md).
