// utils/exportKeuangan.ts
// Utilitas untuk meng-export laporan keuangan ke Excel (2 sheet) dan PDF (1 laporan)

import type { Transaksi } from '~/composables/useKeuangan'
import { useKeuangan, getPeriodeLabel } from '~/composables/useKeuangan'

/**
 * Simulasi proses Export Laporan Keuangan ke format Excel.
 * Struktur file final akan terdiri dari 2 sheet.
 */
export const exportToExcel = async (dataTransaksi: Transaksi[], aum: string, periode: string) => {
  console.log(`[Export Excel] Memulai proses export untuk ${aum}...`)
  
  const { dataUntukBukuBesar, dataUntukLabaRugi } = useKeuangan()
  const periodeLabel = getPeriodeLabel(periode)
  
  // 1. Siapkan Data Sheet 1: Buku Besar
  const bukuBesar = dataUntukBukuBesar(dataTransaksi)
  console.log(`[Sheet 1: Buku Besar] Tersedia ${bukuBesar.length} baris akun aktif.`)
  
  // 2. Siapkan Data Sheet 2: Laporan Laba-Rugi
  const labaRugi = dataUntukLabaRugi(dataTransaksi, periodeLabel)
  console.log(`[Sheet 2: Laba Rugi] Laba/Rugi Bersih: Rp ${labaRugi.labaRugiBersih}`)

  const fileName = `Laporan Keuangan - ${aum} - ${periodeLabel}.xlsx`

  // TODO (Backend Phase):
  // Integrasi dengan library seperti 'exceljs' atau 'xlsx' untuk men-generate file fisik
  // 1. Buat workbook baru
  // 2. Buat worksheet 1 ("Buku Besar"), looping data `bukuBesar` ke rows
  // 3. Buat worksheet 2 ("Laporan Laba-Rugi"), desain layout laporan dengan `labaRugi`
  // 4. Trigger file download ke browser menggunakan Blob/URL.createObjectURL

  alert(`(SIMULASI) File Excel "${fileName}" dengan 2 sheet (Buku Besar & Laba-Rugi) berhasil di-generate! Data dapat dilihat di Console.`)
  
  return {
    fileName,
    sheet1: bukuBesar,
    sheet2: labaRugi
  }
}

/**
 * Simulasi proses Export Laporan Keuangan ke format PDF.
 * Hanya akan menampilkan Laporan Laba-Rugi (ringkasan eksekutif).
 */
export const exportToPDF = async (dataTransaksi: Transaksi[], aum: string, periode: string) => {
  console.log(`[Export PDF] Memulai proses export untuk ${aum}...`)
  
  const { dataUntukLabaRugi } = useKeuangan()
  const periodeLabel = getPeriodeLabel(periode)
  
  // Data PDF murni mengambil agregasi Laba-Rugi saja
  const labaRugi = dataUntukLabaRugi(dataTransaksi, periodeLabel)
  const fileName = `Laporan Keuangan - ${aum} - ${periodeLabel}.pdf`

  // TODO (Backend Phase):
  // Integrasi dengan library seperti 'jspdf' dan 'jspdf-autotable', atau render HTML ke PDF
  // 1. Siapkan header kop surat PCM Berbah / Unit AUM
  // 2. Render struktur `labaRugi` ke dalam tabel PDF
  // 3. Tambahkan footer ttd (Admin / Ketua PCM)
  // 4. Trigger file download `.pdf`

  alert(`(SIMULASI) File PDF "${fileName}" (Laporan Laba-Rugi) berhasil di-generate!`)
  
  return {
    fileName,
    labaRugi
  }
}
