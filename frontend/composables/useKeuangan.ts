// composables/useKeuangan.ts
// Master composable keuangan. Berisi:
//   - Chart of Accounts (CoA) mapping
//   - Singleton dummy data (shared state antar halaman)
//   - Semua fungsi filter & agregasi
//   - CRUD operations (tambah / edit / hapus)
//   - Struktur data untuk export Excel & PDF

import { ref } from 'vue'
import { AUM_LIST, normalizeAumName } from './useAum'

const STORAGE_KEY = 'pcm_berbah_keuangan_data'

const normalizeTransaction = (item) => {
  if (!item || typeof item !== 'object') return null

  const account = CHART_OF_ACCOUNTS.find(akun => akun.kode === String(item.kode_akun))
  const nominal = Number(item.nominal)
  const tanggal = String(item.tanggal || '')
  const id = String(item.id || '')
  const aum = normalizeAumName(item.aum)

  if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) return null
  const [year, month, day] = tanggal.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  if (!account || !Number.isFinite(nominal) || nominal <= 0) return null
  if (!AUM_LIST.includes(aum)) return null

  return {
    id,
    tanggal,
    kode_akun: account.kode,
    keterangan: typeof item.keterangan === 'string' ? item.keterangan : '',
    tipe: account.tipe,
    nominal,
    aum,
    diedit_oleh: typeof item.diedit_oleh === 'string' ? item.diedit_oleh : null,
    diedit_pada: typeof item.diedit_pada === 'string' ? item.diedit_pada : null,
  }
}

// ─── 1. CHART OF ACCOUNTS ────────────────────────────────────────────────────
// Setiap akun punya: kode (identifier internal), nama (label untuk UI),
// tipe (pemasukan/pengeluaran), kelompok (utama/lain-lain untuk laporan L/R)

export const CHART_OF_ACCOUNTS = [
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

// Lookup nama akun dari kode. Fallback ke kode itu sendiri kalau tidak ketemu.
export const getNamaAkun = (kode) =>
  CHART_OF_ACCOUNTS.find(a => a.kode === kode)?.nama ?? kode

// Filter CoA berdasarkan tipe transaksi (untuk dropdown di form input).
export const getAkunByTipe = (tipe) =>
  CHART_OF_ACCOUNTS.filter(a => a.tipe === tipe)

// ─── 2. SINGLETON DUMMY DATA (shared state) ───────────────────────────────────
// Menggunakan ref di module level agar reactive state dibagi oleh semua
// komponen yang memanggil useKeuangan() — mirip store sederhana.

const INITIAL_DATA = [
  // ── PCM Berbah — Hari Ini (16 Agustus 2026) ──
  { id: '1',  tanggal: '2026-08-16', kode_akun: '4101', keterangan: 'Infaq Jumat Keliling wilayah ranting utara', tipe: 'pemasukan',  nominal: 4500000,  aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '2',  tanggal: '2026-08-16', kode_akun: '6210', keterangan: 'Konsumsi rapat koordinasi bulanan pimpinan cabang', tipe: 'pengeluaran', nominal: 350000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '3',  tanggal: '2026-08-16', kode_akun: '4101', keterangan: 'Donasi simpatisan Bpk. H. Abdullah', tipe: 'pemasukan', nominal: 1000000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '4',  tanggal: '2026-08-16', kode_akun: '4102', keterangan: 'Sumbangan pembangunan panti asuhan', tipe: 'pemasukan', nominal: 2500000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '5',  tanggal: '2026-08-16', kode_akun: '6150', keterangan: 'Perbaikan atap bocor gedung dakwah PCM Berbah', tipe: 'pengeluaran', nominal: 1800000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '6',  tanggal: '2026-08-16', kode_akun: '6190', keterangan: 'Pembelian alat kebersihan', tipe: 'pengeluaran', nominal: 150000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  // ── PCM Berbah — Bulan Ini ──
  { id: '7',  tanggal: '2026-08-12', kode_akun: '4101', keterangan: 'Setoran Lazismu bulan berjalan', tipe: 'pemasukan', nominal: 12000000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '8',  tanggal: '2026-08-10', kode_akun: '6120', keterangan: 'Tagihan listrik, air PDAM, dan internet gedung dakwah Agustus', tipe: 'pengeluaran', nominal: 850000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '9',  tanggal: '2026-08-05', kode_akun: '6260', keterangan: 'Dana bantuan sosial untuk warga isoman', tipe: 'pengeluaran', nominal: 3000000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '10', tanggal: '2026-08-02', kode_akun: '4101', keterangan: 'Hasil kotak infaq pengajian Ahad Pagi', tipe: 'pemasukan', nominal: 6750000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '11', tanggal: '2026-08-01', kode_akun: '6100', keterangan: 'Gaji karyawan PCM Berbah bulan Agustus', tipe: 'pengeluaran', nominal: 8500000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  // ── PCM Berbah — Bulan Lalu & Lebih Lama ──
  { id: '12', tanggal: '2026-07-20', kode_akun: '7100', keterangan: 'Bunga tabungan rekening PCM Juli', tipe: 'pemasukan', nominal: 125000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '13', tanggal: '2026-07-15', kode_akun: '8200', keterangan: 'Biaya admin transfer bank BRI Juli', tipe: 'pengeluaran', nominal: 45000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '14', tanggal: '2026-07-01', kode_akun: '6100', keterangan: 'Gaji karyawan PCM Berbah bulan Juli', tipe: 'pengeluaran', nominal: 8500000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '15', tanggal: '2026-06-15', kode_akun: '4101', keterangan: 'Infaq Jumat bulan Juni', tipe: 'pemasukan', nominal: 5200000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '16', tanggal: '2026-05-10', kode_akun: '6240', keterangan: 'Iuran BPJS dan retribusi perizinan', tipe: 'pengeluaran', nominal: 750000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '17', tanggal: '2026-04-01', kode_akun: '4103', keterangan: 'Pendapatan sewa gedung serbaguna April', tipe: 'pemasukan', nominal: 3500000, aum: 'PCM Berbah', diedit_oleh: null, diedit_pada: null },
  // ── SD Muhammadiyah Karangharjo ──
  { id: '18', tanggal: '2026-08-16', kode_akun: '4101', keterangan: 'SPP siswa bulan Agustus', tipe: 'pemasukan', nominal: 15000000, aum: 'SD Muhammadiyah Karangharjo', diedit_oleh: null, diedit_pada: null },
  { id: '19', tanggal: '2026-08-16', kode_akun: '6200', keterangan: 'Pembelian ATK dan bahan ajar', tipe: 'pengeluaran', nominal: 1200000, aum: 'SD Muhammadiyah Karangharjo', diedit_oleh: null, diedit_pada: null },
  { id: '20', tanggal: '2026-08-10', kode_akun: '6100', keterangan: 'Gaji guru dan karyawan bulan Agustus', tipe: 'pengeluaran', nominal: 32000000, aum: 'SD Muhammadiyah Karangharjo', diedit_oleh: null, diedit_pada: null },
  { id: '21', tanggal: '2026-08-05', kode_akun: '6120', keterangan: 'Tagihan listrik dan air Agustus', tipe: 'pengeluaran', nominal: 1800000, aum: 'SD Muhammadiyah Karangharjo', diedit_oleh: null, diedit_pada: null },
  { id: '22', tanggal: '2026-07-25', kode_akun: '4102', keterangan: 'Pendapatan kegiatan ekstrakurikuler', tipe: 'pemasukan', nominal: 4500000, aum: 'SD Muhammadiyah Karangharjo', diedit_oleh: null, diedit_pada: null },
  { id: '23', tanggal: '2026-03-15', kode_akun: '4101', keterangan: 'Dana BOS Semester 2 tahun ajaran lalu', tipe: 'pemasukan', nominal: 42000000, aum: 'SD Muhammadiyah Karangharjo', diedit_oleh: null, diedit_pada: null },
  // ── SD Muhammadiyah Pajangan 1 ──
  { id: '24', tanggal: '2026-08-14', kode_akun: '4101', keterangan: 'SPP siswa bulan Agustus', tipe: 'pemasukan', nominal: 11000000, aum: 'SD Muhammadiyah Pajangan 1', diedit_oleh: null, diedit_pada: null },
  { id: '25', tanggal: '2026-07-20', kode_akun: '6150', keterangan: 'Perawatan gedung dan fasilitas', tipe: 'pengeluaran', nominal: 3200000, aum: 'SD Muhammadiyah Pajangan 1', diedit_oleh: null, diedit_pada: null },
  // ── SMP Muhammadiyah 1 Berbah ──
  { id: '26', tanggal: '2026-08-10', kode_akun: '6100', keterangan: 'Gaji guru honorer bulan Agustus', tipe: 'pengeluaran', nominal: 8500000, aum: 'SMP Muhammadiyah 1 Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '27', tanggal: '2026-08-01', kode_akun: '4101', keterangan: 'SPP siswa bulan Agustus', tipe: 'pemasukan', nominal: 12000000, aum: 'SMP Muhammadiyah 1 Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '28', tanggal: '2026-08-08', kode_akun: '6120', keterangan: 'Tagihan listrik dan air Agustus', tipe: 'pengeluaran', nominal: 2100000, aum: 'SMP Muhammadiyah 1 Berbah', diedit_oleh: null, diedit_pada: null },
  // ── SMK Muhammadiyah Berbah ──
  { id: '29', tanggal: '2026-08-01', kode_akun: '4101', keterangan: 'Dana BOS SMK Semester 1', tipe: 'pemasukan', nominal: 45000000, aum: 'SMK Muhammadiyah Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '30', tanggal: '2026-08-05', kode_akun: '6100', keterangan: 'Gaji guru dan staff bulan Agustus', tipe: 'pengeluaran', nominal: 48000000, aum: 'SMK Muhammadiyah Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '31', tanggal: '2026-08-08', kode_akun: '6230', keterangan: 'Pelatihan sertifikasi guru produktif', tipe: 'pengeluaran', nominal: 5000000, aum: 'SMK Muhammadiyah Berbah', diedit_oleh: null, diedit_pada: null },
  // ── Klinik PKU Muhammadiyah Berbah ──
  { id: '32', tanggal: '2026-08-16', kode_akun: '4101', keterangan: 'Pendapatan jasa layanan kesehatan harian', tipe: 'pemasukan', nominal: 6500000, aum: 'Klinik PKU Muhammadiyah Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '33', tanggal: '2026-08-16', kode_akun: '6190', keterangan: 'Pembelian obat-obatan dan bahan habis pakai medis', tipe: 'pengeluaran', nominal: 4200000, aum: 'Klinik PKU Muhammadiyah Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '34', tanggal: '2026-08-10', kode_akun: '6100', keterangan: 'Gaji dokter dan tenaga medis Agustus', tipe: 'pengeluaran', nominal: 18000000, aum: 'Klinik PKU Muhammadiyah Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '35', tanggal: '2026-08-05', kode_akun: '8200', keterangan: 'Biaya administrasi klaim BPJS', tipe: 'pengeluaran', nominal: 150000, aum: 'Klinik PKU Muhammadiyah Berbah', diedit_oleh: null, diedit_pada: null },
  { id: '36', tanggal: '2026-07-28', kode_akun: '7100', keterangan: 'Bunga deposito klinik Juli', tipe: 'pemasukan', nominal: 85000, aum: 'Klinik PKU Muhammadiyah Berbah', diedit_oleh: null, diedit_pada: null },
]

const getInitialData = () => INITIAL_DATA.map(normalizeTransaction).filter(Boolean)

const loadStoredData = () => {
  if (!import.meta.client) return getInitialData()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getInitialData()

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return getInitialData()

    const normalized = parsed.map(normalizeTransaction).filter(Boolean)
    return normalized.length || parsed.length === 0 ? normalized : getInitialData()
  } catch {
    return getInitialData()
  }
}

const persistData = () => {
  if (!import.meta.client) return

  localStorage.setItem(STORAGE_KEY, JSON.stringify(_data.value))
}

const _data = ref(loadStoredData())

// ─── 3. HELPERS FILTER ────────────────────────────────────────────────────────

const _filterPeriode = (data, periode) => {
  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-')
  const currentMonth = today.slice(0, 7)
  const sixMonthStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const startDate = [
    sixMonthStart.getFullYear(),
    String(sixMonthStart.getMonth() + 1).padStart(2, '0'),
    '01'
  ].join('-')

  return data.filter(item => {
    if (typeof item.tanggal !== 'string') return false
    if (periode === 'harian') return item.tanggal === today
    if (periode === 'bulanan') return item.tanggal.startsWith(currentMonth) && item.tanggal <= today
    if (periode === '6_bulanan') return item.tanggal >= startDate && item.tanggal <= today
    return false
  })
}

// Label periode dalam Bahasa Indonesia untuk judul laporan
export const getPeriodeLabel = (periode) => {
  const now = new Date()
  const bulan = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  const hari  = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  if (periode === 'harian')  return `Tanggal ${hari}`
  if (periode === 'bulanan') return `Periode ${bulan}`

  if (periode !== '6_bulanan') return 'Periode tidak valid'

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const from = sixMonthsAgo.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  return `Periode ${from} – ${bulan}`
}

// ─── 4. AGREGASI ──────────────────────────────────────────────────────────────

const _ringkasanPerKategori = (data) => {
  const map = new Map()
  data.forEach(t => {
    const nominal = Number(t.nominal)
    if (!Number.isFinite(nominal)) return
    map.set(t.kode_akun, (map.get(t.kode_akun) ?? 0) + nominal)
  })
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

// ─── 5. COMPOSABLE EXPORT ─────────────────────────────────────────────────────

export const useKeuangan = () => {

  // Ambil transaksi yang sudah difilter AUM + periode
  const getFiltered = (aum, periode) => {
    const byAum = aum === 'Semua AUM'
      ? _data.value
      : _data.value.filter(t => t.aum === aum)

    return _filterPeriode(byAum, periode)
  }

  // Hitung ringkasan saldo dari array transaksi yang sudah difilter
  const hitungRingkasan = (data) => {
    const totalPemasukan = data
      .filter(t => t.tipe === 'pemasukan')
      .reduce((s, t) => s + (Number.isFinite(Number(t.nominal)) ? Number(t.nominal) : 0), 0)
    const totalPengeluaran = data
      .filter(t => t.tipe === 'pengeluaran')
      .reduce((s, t) => s + (Number.isFinite(Number(t.nominal)) ? Number(t.nominal) : 0), 0)
    return { totalPemasukan, totalPengeluaran, saldoAkhir: totalPemasukan - totalPengeluaran }
  }

  // Ringkasan per kategori untuk tabel Home (satu baris per nama akun)
  const ringkasanPerKategori = (data) => _ringkasanPerKategori(data)

  // DATA EXPORT — Sheet 1: Buku Besar
  // Group by kode_akun, pisahkan Debet/Kredit (Pemasukan = Kredit, Pengeluaran = Debet)
  const dataUntukBukuBesar = (data) => {
    const map = new Map()
    data.forEach(t => {
      const cur = map.get(t.kode_akun) ?? { debet: 0, kredit: 0 }
      const nominal = Number(t.nominal)
      if (!Number.isFinite(nominal)) return
      if (t.tipe === 'pemasukan') cur.kredit += nominal
      if (t.tipe === 'pengeluaran') cur.debet += nominal
      map.set(t.kode_akun, cur)
    })
    return CHART_OF_ACCOUNTS
      .filter(akun => map.has(akun.kode))
      .map(akun => {
        const { debet, kredit } = map.get(akun.kode)
        return { kode_akun: akun.kode, nama: akun.nama, tipe: akun.tipe, kelompok: akun.kelompok, debet, kredit, saldo: kredit - debet }
      })
  }

  // DATA EXPORT — Sheet 2 & PDF: Laporan Laba-Rugi
  const dataUntukLabaRugi = (data, periodeLabel) => {
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
      pendapatanUtama:  { judul: 'PENDAPATAN',  items: pendapatanUtamaItems.map(k => ({ nama: k.nama, jumlah: k.total })),  total: totalPendapatanUtama },
      pengeluaranUtama: { judul: 'PENGELUARAN', items: pengeluaranUtamaItems.map(k => ({ nama: k.nama, jumlah: k.total })), total: totalPengeluaranUtama },
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

  // ── CRUD ──────────────────────────────────────────────────────────────────

  // Tambah transaksi baru (Admin AUM atau Superadmin)
  const tambahTransaksi = (t) => {
    const account = CHART_OF_ACCOUNTS.find(akun => akun.kode === t.kode_akun)
    const normalized = normalizeTransaction({
      ...t,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tipe: account?.tipe,
      diedit_oleh: null,
      diedit_pada: null,
    })
    if (!normalized) return false

    const previous = [..._data.value]
    try {
      _data.value.unshift(normalized)
      persistData()
      return true
    } catch {
      _data.value = previous
      return false
    }
  }

  // Edit transaksi — hanya boleh dipanggil oleh Superadmin
  const editTransaksi = (id, updates, editedBy) => {
    const idx = _data.value.findIndex(t => t.id === id)
    if (idx === -1) return false

    const previous = { ..._data.value[idx] }
    const normalized = normalizeTransaction({
      ...previous,
      ...updates,
      id: previous.id,
      diedit_oleh: editedBy,
      diedit_pada: new Date().toISOString(),
    })
    if (!normalized) return false

    try {
      _data.value[idx] = normalized
      persistData()
      return true
    } catch {
      _data.value[idx] = previous
      return false
    }
  }

  // Hapus transaksi — hanya boleh dipanggil oleh Superadmin
  const hapusTransaksi = (id) => {
    const idx = _data.value.findIndex(t => t.id === id)
    if (idx === -1) return false

    const deleted = _data.value[idx]
    try {
      _data.value.splice(idx, 1)
      persistData()
      return true
    } catch {
      _data.value.splice(idx, 0, deleted)
      return false
    }
  }

  return {
    transaksiData: _data,
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
