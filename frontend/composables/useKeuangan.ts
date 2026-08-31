// composables/useKeuangan.ts
// Master composable keuangan. Berisi:
//   - Chart of Accounts (CoA) mapping
//   - Singleton dummy data (shared state antar halaman)
//   - Semua fungsi filter & agregasi
//   - CRUD operations (tambah / edit / hapus)
//   - Struktur data untuk export Excel & PDF

import { ref } from 'vue'

// ─── 1. CHART OF ACCOUNTS ────────────────────────────────────────────────────

export interface AkunItem {
  kode: string
  nama: string
  tipe: 'pemasukan' | 'pengeluaran'
  /** 'utama' = bagian atas L/R; 'lain-lain' = bagian bawah L/R */
  kelompok: 'utama' | 'lain-lain'
}

export const CHART_OF_ACCOUNTS: AkunItem[] = [
  // ── PENDAPATAN UTAMA ──
  { kode: '4101', nama: 'Pendapatan - Jasa 1',  tipe: 'pemasukan', kelompok: 'utama' },
  { kode: '4102', nama: 'Pendapatan - Jasa 2',  tipe: 'pemasukan', kelompok: 'utama' },
  { kode: '4103', nama: 'Pendapatan - Jasa 3',  tipe: 'pemasukan', kelompok: 'utama' },
  // ── PENDAPATAN LAIN-LAIN ──
  { kode: '7100', nama: 'Bunga Bank',            tipe: 'pemasukan', kelompok: 'lain-lain' },
  // ── BEBAN UTAMA ──
  { kode: '6100', nama: 'Beban - Gaji Karyawan',                     tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6110', nama: 'Beban - Administrasi',                       tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6120', nama: 'Beban - Listrik, Air, Telpon',               tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6130', nama: 'Beban - Sewa Kantor',                        tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6140', nama: 'Beban - Asuransi',                           tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6150', nama: 'Beban - Service dan Perawatan',              tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6160', nama: 'Beban - Perlengkapan Kantor',                tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6170', nama: 'Beban - Penyusutan Perangkat Elektronik',    tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6180', nama: 'Beban - Penyusutan Mobil dan Motor',         tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6190', nama: 'Beban - Bahan Habis Pakai',                  tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6200', nama: 'Beban - Alat Tulis Kantor',                  tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6210', nama: 'Beban - Rumah Tangga Kantor',                tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6220', nama: 'Beban - Pemasaran/Iklan/Entertainment',      tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6230', nama: 'Beban - Training',                           tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6240', nama: 'Beban - Iuran/Retribusi',                    tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6250', nama: 'Beban - Penyusutan Furnitur',                tipe: 'pengeluaran', kelompok: 'utama' },
  { kode: '6260', nama: 'Beban - Operasional Karyawan',               tipe: 'pengeluaran', kelompok: 'utama' },
  // ── BEBAN LAIN-LAIN ──
  { kode: '8100', nama: 'Beban - Bunga Bank', tipe: 'pengeluaran', kelompok: 'lain-lain' },
  { kode: '8200', nama: 'Administrasi Bank',  tipe: 'pengeluaran', kelompok: 'lain-lain' },
]

/** Lookup nama akun dari kode. Fallback ke kode itu sendiri kalau tidak ketemu. */
export const getNamaAkun = (kode: string): string =>
  CHART_OF_ACCOUNTS.find(a => a.kode === kode)?.nama ?? kode

/** Filter CoA berdasarkan tipe transaksi (untuk dropdown di form input). */
export const getAkunByTipe = (tipe: 'pemasukan' | 'pengeluaran'): AkunItem[] =>
  CHART_OF_ACCOUNTS.filter(a => a.tipe === tipe)

// ─── 2. TYPES ─────────────────────────────────────────────────────────────────

export interface Transaksi {
  id: string
  tanggal: string          // 'YYYY-MM-DD'
  kode_akun: string        // identifier internal, TIDAK ditampilkan di UI harian
  keterangan: string       // catatan bebas opsional
  tipe: 'pemasukan' | 'pengeluaran'
  nominal: number
  aum: string              // nama unit (dari AUM_LIST)
  diedit_oleh: string | null
  diedit_pada: string | null
}

export interface RingkasanKeuangan {
  totalPemasukan: number
  totalPengeluaran: number
  saldoAkhir: number
}

export interface RingkasanKategori {
  kode_akun: string
  nama: string
  tipe: 'pemasukan' | 'pengeluaran'
  kelompok: 'utama' | 'lain-lain'
  total: number
}

// ─── Export types ─────────────────────────────────────────────────────────────

export interface BukuBesarRow {
  kode_akun: string
  nama: string
  debet: number
  kredit: number
  saldo: number
}

export interface LabaRugiSection {
  judul: string
  items: { nama: string; jumlah: number }[]
  total: number
}

export interface LabaRugiData {
  pendapatanUtama: LabaRugiSection
  pengeluaranUtama: LabaRugiSection
  labaRugiKotor: number
  lainLain: LabaRugiSection
  labaRugiBersih: number
  judulPeriode: string      // mis. "Agustus 2026" atau "25 Agustus 2026"
}

// ─── 3. SINGLETON DUMMY DATA (shared state) ───────────────────────────────────
// Menggunakan ref di module level (bukan di dalam fungsi) agar reactive state
// dibagi oleh semua komponen yang memanggil useKeuangan() — mirip Pinia store.

const _data = ref<Transaksi[]>([
  // ── PCM Pusat — Hari Ini (16 Agustus 2026) ──
  { id: '1',  tanggal: '2026-08-16', kode_akun: '4101', keterangan: 'Infaq Jumat Keliling wilayah ranting utara', tipe: 'pemasukan',  nominal: 4500000,  aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '2',  tanggal: '2026-08-16', kode_akun: '6210', keterangan: 'Konsumsi rapat koordinasi bulanan pimpinan cabang', tipe: 'pengeluaran', nominal: 350000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '3',  tanggal: '2026-08-16', kode_akun: '4101', keterangan: 'Donasi simpatisan Bpk. H. Abdullah', tipe: 'pemasukan', nominal: 1000000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '4',  tanggal: '2026-08-16', kode_akun: '4102', keterangan: 'Sumbangan pembangunan panti asuhan', tipe: 'pemasukan', nominal: 2500000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '5',  tanggal: '2026-08-16', kode_akun: '6150', keterangan: 'Perbaikan atap bocor gedung dakwah PCM Berbah', tipe: 'pengeluaran', nominal: 1800000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '6',  tanggal: '2026-08-16', kode_akun: '6190', keterangan: 'Pembelian alat kebersihan', tipe: 'pengeluaran', nominal: 150000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  // ── PCM Pusat — Bulan Ini ──
  { id: '7',  tanggal: '2026-08-12', kode_akun: '4101', keterangan: 'Setoran Lazismu bulan berjalan', tipe: 'pemasukan', nominal: 12000000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '8',  tanggal: '2026-08-10', kode_akun: '6120', keterangan: 'Tagihan listrik, air PDAM, dan internet gedung dakwah Agustus', tipe: 'pengeluaran', nominal: 850000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '9',  tanggal: '2026-08-05', kode_akun: '6260', keterangan: 'Dana bantuan sosial untuk warga isoman', tipe: 'pengeluaran', nominal: 3000000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '10', tanggal: '2026-08-02', kode_akun: '4101', keterangan: 'Hasil kotak infaq pengajian Ahad Pagi', tipe: 'pemasukan', nominal: 6750000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '11', tanggal: '2026-08-01', kode_akun: '6100', keterangan: 'Gaji karyawan PCM Pusat bulan Agustus', tipe: 'pengeluaran', nominal: 8500000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  // ── PCM Pusat — Bulan Lalu & Lebih Lama ──
  { id: '12', tanggal: '2026-07-20', kode_akun: '7100', keterangan: 'Bunga tabungan rekening PCM Juli', tipe: 'pemasukan', nominal: 125000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '13', tanggal: '2026-07-15', kode_akun: '8200', keterangan: 'Biaya admin transfer bank BRI Juli', tipe: 'pengeluaran', nominal: 45000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '14', tanggal: '2026-07-01', kode_akun: '6100', keterangan: 'Gaji karyawan PCM Pusat bulan Juli', tipe: 'pengeluaran', nominal: 8500000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '15', tanggal: '2026-06-15', kode_akun: '4101', keterangan: 'Infaq Jumat bulan Juni', tipe: 'pemasukan', nominal: 5200000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '16', tanggal: '2026-05-10', kode_akun: '6240', keterangan: 'Iuran BPJS dan retribusi perizinan', tipe: 'pengeluaran', nominal: 750000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  { id: '17', tanggal: '2026-04-01', kode_akun: '4103', keterangan: 'Pendapatan sewa gedung serbaguna April', tipe: 'pemasukan', nominal: 3500000, aum: 'PCM Pusat', diedit_oleh: null, diedit_pada: null },
  // ── SD Muhammadiyah 1 ──
  { id: '18', tanggal: '2026-08-16', kode_akun: '4101', keterangan: 'SPP siswa bulan Agustus', tipe: 'pemasukan', nominal: 15000000, aum: 'SD Muhammadiyah 1', diedit_oleh: null, diedit_pada: null },
  { id: '19', tanggal: '2026-08-16', kode_akun: '6200', keterangan: 'Pembelian ATK dan bahan ajar', tipe: 'pengeluaran', nominal: 1200000, aum: 'SD Muhammadiyah 1', diedit_oleh: null, diedit_pada: null },
  { id: '20', tanggal: '2026-08-10', kode_akun: '6100', keterangan: 'Gaji guru dan karyawan bulan Agustus', tipe: 'pengeluaran', nominal: 32000000, aum: 'SD Muhammadiyah 1', diedit_oleh: null, diedit_pada: null },
  { id: '21', tanggal: '2026-08-05', kode_akun: '6120', keterangan: 'Tagihan listrik dan air Agustus', tipe: 'pengeluaran', nominal: 1800000, aum: 'SD Muhammadiyah 1', diedit_oleh: null, diedit_pada: null },
  { id: '22', tanggal: '2026-07-25', kode_akun: '4102', keterangan: 'Pendapatan kegiatan ekstrakurikuler', tipe: 'pemasukan', nominal: 4500000, aum: 'SD Muhammadiyah 1', diedit_oleh: null, diedit_pada: null },
  { id: '23', tanggal: '2026-03-15', kode_akun: '4101', keterangan: 'Dana BOS Semester 2 tahun ajaran lalu', tipe: 'pemasukan', nominal: 42000000, aum: 'SD Muhammadiyah 1', diedit_oleh: null, diedit_pada: null },
  // ── SD Muhammadiyah 2 ──
  { id: '24', tanggal: '2026-08-14', kode_akun: '4101', keterangan: 'SPP siswa bulan Agustus', tipe: 'pemasukan', nominal: 11000000, aum: 'SD Muhammadiyah 2', diedit_oleh: null, diedit_pada: null },
  { id: '25', tanggal: '2026-07-20', kode_akun: '6150', keterangan: 'Perawatan gedung dan fasilitas', tipe: 'pengeluaran', nominal: 3200000, aum: 'SD Muhammadiyah 2', diedit_oleh: null, diedit_pada: null },
  // ── SMP Muhammadiyah ──
  { id: '26', tanggal: '2026-08-10', kode_akun: '6100', keterangan: 'Gaji guru honorer bulan Agustus', tipe: 'pengeluaran', nominal: 8500000, aum: 'SMP Muhammadiyah', diedit_oleh: null, diedit_pada: null },
  { id: '27', tanggal: '2026-08-01', kode_akun: '4101', keterangan: 'SPP siswa bulan Agustus', tipe: 'pemasukan', nominal: 12000000, aum: 'SMP Muhammadiyah', diedit_oleh: null, diedit_pada: null },
  { id: '28', tanggal: '2026-08-08', kode_akun: '6120', keterangan: 'Tagihan listrik dan air Agustus', tipe: 'pengeluaran', nominal: 2100000, aum: 'SMP Muhammadiyah', diedit_oleh: null, diedit_pada: null },
  // ── SMK Muhammadiyah ──
  { id: '29', tanggal: '2026-08-01', kode_akun: '4101', keterangan: 'Dana BOS SMK Semester 1', tipe: 'pemasukan', nominal: 45000000, aum: 'SMK Muhammadiyah', diedit_oleh: null, diedit_pada: null },
  { id: '30', tanggal: '2026-08-05', kode_akun: '6100', keterangan: 'Gaji guru dan staff bulan Agustus', tipe: 'pengeluaran', nominal: 48000000, aum: 'SMK Muhammadiyah', diedit_oleh: null, diedit_pada: null },
  { id: '31', tanggal: '2026-08-08', kode_akun: '6230', keterangan: 'Pelatihan sertifikasi guru produktif', tipe: 'pengeluaran', nominal: 5000000, aum: 'SMK Muhammadiyah', diedit_oleh: null, diedit_pada: null },
  // ── Klinik Muhammadiyah ──
  { id: '32', tanggal: '2026-08-16', kode_akun: '4101', keterangan: 'Pendapatan jasa layanan kesehatan harian', tipe: 'pemasukan', nominal: 6500000, aum: 'Klinik Muhammadiyah', diedit_oleh: null, diedit_pada: null },
  { id: '33', tanggal: '2026-08-16', kode_akun: '6190', keterangan: 'Pembelian obat-obatan dan bahan habis pakai medis', tipe: 'pengeluaran', nominal: 4200000, aum: 'Klinik Muhammadiyah', diedit_oleh: null, diedit_pada: null },
  { id: '34', tanggal: '2026-08-10', kode_akun: '6100', keterangan: 'Gaji dokter dan tenaga medis Agustus', tipe: 'pengeluaran', nominal: 18000000, aum: 'Klinik Muhammadiyah', diedit_oleh: null, diedit_pada: null },
  { id: '35', tanggal: '2026-08-05', kode_akun: '8200', keterangan: 'Biaya administrasi klaim BPJS', tipe: 'pengeluaran', nominal: 150000, aum: 'Klinik Muhammadiyah', diedit_oleh: null, diedit_pada: null },
  { id: '36', tanggal: '2026-07-28', kode_akun: '7100', keterangan: 'Bunga deposito klinik Juli', tipe: 'pemasukan', nominal: 85000, aum: 'Klinik Muhammadiyah', diedit_oleh: null, diedit_pada: null },
])

// ─── 4. HELPERS FILTER ────────────────────────────────────────────────────────

const _filterPeriode = (data: Transaksi[], periode: string): Transaksi[] => {
  const now = new Date()
  return data.filter(item => {
    const d = new Date(item.tanggal)
    if (periode === 'harian') return d.toDateString() === now.toDateString()
    if (periode === 'bulanan')
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    // 6 bulanan
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    return d >= sixMonthsAgo
  })
}

/** Label periode dalam Bahasa Indonesia untuk judul laporan */
export const getPeriodeLabel = (periode: string): string => {
  const now = new Date()
  const bulan = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  const hari  = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  if (periode === 'harian')   return `Tanggal ${hari}`
  if (periode === 'bulanan')  return `Periode ${bulan}`

  const sixMonthsAgo = new Date(now)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  const from = sixMonthsAgo.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  return `Periode ${from} – ${bulan}`
}

// ─── 5. AGREGASI ──────────────────────────────────────────────────────────────

const _ringkasanPerKategori = (data: Transaksi[]): RingkasanKategori[] => {
  const map = new Map<string, number>()
  data.forEach(t => map.set(t.kode_akun, (map.get(t.kode_akun) ?? 0) + t.nominal))
  return CHART_OF_ACCOUNTS
    .filter(akun => map.has(akun.kode))
    .map(akun => ({
      kode_akun: akun.kode,
      nama:      akun.nama,
      tipe:      akun.tipe,
      kelompok:  akun.kelompok,
      total:     map.get(akun.kode) ?? 0,
    }))
}

// ─── 6. COMPOSABLE EXPORT ─────────────────────────────────────────────────────

export const useKeuangan = () => {

  /** Ambil transaksi yang sudah difilter AUM + periode */
  const getFiltered = (aum: string, periode: string): Transaksi[] =>
    _filterPeriode(_data.value.filter(t => t.aum === aum), periode)

  /** Hitung ringkasan saldo dari array transaksi yang sudah difilter */
  const hitungRingkasan = (data: Transaksi[]): RingkasanKeuangan => {
    const totalPemasukan   = data.filter(t => t.tipe === 'pemasukan').reduce((s, t) => s + t.nominal, 0)
    const totalPengeluaran = data.filter(t => t.tipe === 'pengeluaran').reduce((s, t) => s + t.nominal, 0)
    return { totalPemasukan, totalPengeluaran, saldoAkhir: totalPemasukan - totalPengeluaran }
  }

  /**
   * Ringkasan per kategori untuk tabel Home — satu baris per nama akun.
   * Output: [{ kode_akun, nama, tipe, kelompok, total }]
   */
  const ringkasanPerKategori = (data: Transaksi[]): RingkasanKategori[] =>
    _ringkasanPerKategori(data)

  /**
   * DATA UNTUK EXPORT — Sheet 1: Buku Besar
   * Group by kode_akun, pisahkan Debet/Kredit sesuai kaidah double-entry.
   * Pemasukan → Kredit | Pengeluaran → Debet
   */
  const dataUntukBukuBesar = (data: Transaksi[]): BukuBesarRow[] => {
    const map = new Map<string, { debet: number; kredit: number }>()
    data.forEach(t => {
      const cur = map.get(t.kode_akun) ?? { debet: 0, kredit: 0 }
      if (t.tipe === 'pemasukan') cur.kredit += t.nominal
      else cur.debet += t.nominal
      map.set(t.kode_akun, cur)
    })
    return CHART_OF_ACCOUNTS
      .filter(akun => map.has(akun.kode))
      .map(akun => {
        const { debet, kredit } = map.get(akun.kode)!
        return { kode_akun: akun.kode, nama: akun.nama, debet, kredit, saldo: kredit - debet }
      })
  }

  /**
   * DATA UNTUK EXPORT — Sheet 2 & PDF: Laporan Laba-Rugi
   * Struktur: Pendapatan Utama → Total → Pengeluaran Utama → Total →
   *           Laba/Rugi Kotor → Lain-lain → Laba/Rugi Bersih
   */
  const dataUntukLabaRugi = (data: Transaksi[], periodeLabel: string): LabaRugiData => {
    const kategori = _ringkasanPerKategori(data)

    const pendapatanUtamaItems  = kategori.filter(k => k.tipe === 'pemasukan'  && k.kelompok === 'utama')
    const pengeluaranUtamaItems = kategori.filter(k => k.tipe === 'pengeluaran' && k.kelompok === 'utama')
    const lainLainItems         = kategori.filter(k => k.kelompok === 'lain-lain')

    const totalPendapatanUtama  = pendapatanUtamaItems.reduce((s, k) => s + k.total, 0)
    const totalPengeluaranUtama = pengeluaranUtamaItems.reduce((s, k) => s + k.total, 0)
    const labaRugiKotor         = totalPendapatanUtama - totalPengeluaranUtama

    const totalLainLain = lainLainItems.reduce((s, k) =>
      k.tipe === 'pemasukan' ? s + k.total : s - k.total, 0)

    return {
      pendapatanUtama:  { judul: 'PENDAPATAN',   items: pendapatanUtamaItems.map(k => ({ nama: k.nama, jumlah: k.total })),  total: totalPendapatanUtama },
      pengeluaranUtama: { judul: 'PENGELUARAN',  items: pengeluaranUtamaItems.map(k => ({ nama: k.nama, jumlah: k.total })), total: totalPengeluaranUtama },
      labaRugiKotor,
      lainLain: {
        judul: 'PENDAPATAN/PENGELUARAN LAIN-LAIN',
        items: lainLainItems.map(k => ({ nama: k.nama, jumlah: k.tipe === 'pemasukan' ? k.total : -k.total })),
        total: totalLainLain,
      },
      labaRugiBersih: labaRugiKotor + totalLainLain,
      judulPeriode: periodeLabel,
    }
  }

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const tambahTransaksi = (t: Omit<Transaksi, 'id' | 'diedit_oleh' | 'diedit_pada'>) => {
    _data.value.unshift({ ...t, id: Date.now().toString(), diedit_oleh: null, diedit_pada: null })
  }

  /** Hanya boleh dipanggil oleh Superadmin. editedBy = username Superadmin. */
  const editTransaksi = (id: string, updates: Partial<Transaksi>, editedBy: string) => {
    const idx = _data.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      _data.value[idx] = {
        ..._data.value[idx],
        ...updates,
        diedit_oleh: editedBy,
        diedit_pada: new Date().toISOString(),
      }
    }
  }

  /** Hanya boleh dipanggil oleh Superadmin. */
  const hapusTransaksi = (id: string) => {
    const idx = _data.value.findIndex(t => t.id === id)
    if (idx !== -1) _data.value.splice(idx, 1)
  }

  return {
    transaksiData: _data,        // reactive ref, bisa di-watch dari komponen mana pun
    getFiltered,
    hitungRingkasan,
    ringkasanPerKategori,
    dataUntukBukuBesar,
    dataUntukLabaRugi,
    tambahTransaksi,
    editTransaksi,
    hapusTransaksi,
  }
}
