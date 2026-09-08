// utils/exportKeuangan.ts
// Utilitas untuk meng-export laporan keuangan ke Excel (2 sheet) dan PDF (1 laporan)

import { CHART_OF_ACCOUNTS, useKeuangan, getPeriodeLabel } from '~/composables/useKeuangan'
// Export ke Excel (2 sheet: format akun + laporan laba-rugi)
export const exportToExcel = async (dataTransaksi, aum, periode) => {
  const { default: ExcelJS } = await import('exceljs')
  const { dataUntukBukuBesar } = useKeuangan()
  const periodeLabel = getPeriodeLabel(periode)

  const bukuBesar = dataUntukBukuBesar(dataTransaksi)
  const fileName  = `Laporan Keuangan - ${aum} - ${periodeLabel}.xlsx`

  const wb = new ExcelJS.Workbook()
  wb.creator = 'PCM Berbah'
  wb.created = new Date()
  wb.calcProperties.fullCalcOnLoad = true

  const warna = {
    hijauGelap: 'FF4F6428',
    hijauBagian: 'FFC4D79B',
    hijauTotal: 'FFD8E4BC',
    hijauMuda: 'FFEBF1DE',
    garis: 'FF76933C',
    putih: 'FFFFFFFF',
    merah: 'FFFF0000',
  }
  const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } })
  const thinGreen = { style: 'thin', color: { argb: warna.garis } }
  const gridBorder = { top: thinGreen, left: thinGreen, bottom: thinGreen, right: thinGreen }
  const numberFormat = '#,##0.00;[Red]-#,##0.00;"-"'
  const nilaiPerAkun = new Map(bukuBesar.map(item => [item.kode_akun, item]))
  const akunDenganNilai = (akun) => {
    const nilai = nilaiPerAkun.get(akun.kode)
    return {
      ...akun,
      debet: nilai?.debet || 0,
      kredit: nilai?.kredit || 0,
    }
  }
  const pendapatan = CHART_OF_ACCOUNTS
    .filter(akun => akun.tipe === 'pemasukan' && akun.kelompok === 'utama')
    .map(akunDenganNilai)
  const pengeluaran = CHART_OF_ACCOUNTS
    .filter(akun => akun.tipe === 'pengeluaran' && akun.kelompok === 'utama')
    .map(akunDenganNilai)
  const lainLain = CHART_OF_ACCOUNTS
    .filter(akun => akun.kelompok === 'lain-lain')
    .map(akunDenganNilai)
  const totalPendapatan = pendapatan.reduce((total, akun) => total + akun.kredit - akun.debet, 0)
  const totalPengeluaran = pengeluaran.reduce((total, akun) => total + akun.debet - akun.kredit, 0)
  const labaRugiKotor = totalPendapatan - totalPengeluaran
  const totalLainLain = lainLain.reduce((total, akun) => total + akun.kredit - akun.debet, 0)
  const labaRugiBersih = labaRugiKotor + totalLainLain

  // Sheet kerja bergaya tabel seperti format sumber, dengan posisi total yang tetap.
  const wsFormat = wb.addWorksheet('PnL Format', {
    views: [{ showGridLines: false }],
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 1, paperSize: 9 },
  })
  wsFormat.columns = [
    { width: 4 },
    { width: 14 },
    { width: 43 },
    { width: 18 },
    { width: 18 },
    { width: 20 },
  ]
  wsFormat.pageSetup.printArea = 'B4:F76'
  wsFormat.mergeCells('B4:F4')
  wsFormat.getCell('B4').value = 'LAPORAN LABA-RUGI'
  wsFormat.getCell('B4').font = { name: 'Arial', size: 15, bold: true }
  wsFormat.getCell('B4').alignment = { horizontal: 'center', vertical: 'middle' }
  wsFormat.mergeCells('B5:F5')
  wsFormat.getCell('B5').value = `${aum} - ${periodeLabel}`
  wsFormat.getCell('B5').font = { name: 'Arial', size: 11 }
  wsFormat.getCell('B5').alignment = { horizontal: 'center', vertical: 'middle' }
  wsFormat.getRow(4).height = 23

  ;['Kode Akun', 'Nama Akun', 'Debet', 'Kredit', 'Saldo'].forEach((judul, index) => {
    const cell = wsFormat.getCell(7, index + 2)
    cell.value = judul
    cell.fill = fill(warna.hijauGelap)
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: warna.putih } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = gridBorder
  })
  wsFormat.getRow(7).height = 21

  const styleFormatRange = (fromRow, toRow) => {
    for (let row = fromRow; row <= toRow; row++) {
      for (let col = 2; col <= 6; col++) {
        const cell = wsFormat.getCell(row, col)
        cell.border = gridBorder
        cell.font = { name: 'Arial', size: 10 }
        cell.alignment = { vertical: 'middle', horizontal: col === 2 ? 'center' : col >= 4 ? 'right' : 'left' }
        if (col === 3 || col === 5) cell.fill = fill(warna.hijauMuda)
        if (col >= 4) cell.numFmt = numberFormat
      }
      wsFormat.getRow(row).height = 18
    }
  }

  const styleSectionRow = (row, label) => {
    wsFormat.mergeCells(row, 2, row, 6)
    const cell = wsFormat.getCell(row, 2)
    cell.value = label
    cell.fill = fill(warna.hijauBagian)
    cell.font = { name: 'Arial', size: 11, bold: true }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = gridBorder
    wsFormat.getRow(row).height = 20
  }
  const styleTotalRow = (row, label, formula, result, strong = false) => {
    for (let col = 2; col <= 6; col++) {
      const cell = wsFormat.getCell(row, col)
      cell.fill = fill(strong ? warna.hijauBagian : warna.hijauTotal)
      cell.border = gridBorder
      cell.font = { name: 'Arial', size: 10, bold: true }
    }
    wsFormat.getCell(row, 3).value = label
    wsFormat.getCell(row, 6).value = { formula, result }
    wsFormat.getCell(row, 6).numFmt = numberFormat
    wsFormat.getCell(row, 6).alignment = { horizontal: 'right' }
    wsFormat.getRow(row).height = 19
  }
  const writeAccounts = (accounts, startRow) => {
    accounts.forEach((akun, index) => {
      const row = startRow + index
      wsFormat.getCell(row, 2).value = akun.kode
      wsFormat.getCell(row, 3).value = akun.nama
      wsFormat.getCell(row, 4).value = akun.debet
      wsFormat.getCell(row, 5).value = akun.kredit
      wsFormat.getCell(row, 6).value = akun.kredit - akun.debet
    })
  }

  styleSectionRow(8, 'PENDAPATAN')
  styleFormatRange(9, 23)
  writeAccounts(pendapatan, 9)
  styleTotalRow(24, 'Total Pendapatan', 'SUM(E9:E23)-SUM(D9:D23)', totalPendapatan)
  styleSectionRow(25, 'PENGELUARAN')
  styleFormatRange(26, 55)
  writeAccounts(pengeluaran, 26)
  styleTotalRow(56, 'Total Pengeluaran', 'SUM(D26:D55)-SUM(E26:E55)', totalPengeluaran)
  styleTotalRow(57, 'Laba/Rugi Kotor', 'F24-F56', labaRugiKotor, true)
  styleSectionRow(58, 'PENDAPATAN/PENGELUARAN LAIN-LAIN')
  styleFormatRange(59, 73)
  writeAccounts(lainLain, 59)
  styleTotalRow(74, 'Total', 'SUM(E59:E73)-SUM(D59:D73)', totalLainLain)
  styleTotalRow(75, 'Laba/Rugi Bersih', 'F57+F74', labaRugiBersih, true)
  wsFormat.mergeCells('B76:F76')
  wsFormat.getCell('B76').value = 'PCM Berbah'
  wsFormat.getCell('B76').font = { name: 'Arial', size: 9, italic: true, color: { argb: warna.hijauGelap } }

  // Sheet laporan bersih mengikuti varian presentasi pada referensi.
  const wsLaporan = wb.addWorksheet('Laporan Laba-Rugi', {
    views: [{ showGridLines: false }],
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 1, paperSize: 9 },
  })
  wsLaporan.columns = [
    { width: 4 },
    { width: 43 },
    { width: 19 },
    { width: 19 },
    { width: 21 },
  ]
  wsLaporan.pageSetup.printArea = 'B6:E39'
  wsLaporan.mergeCells('B6:E6')
  wsLaporan.getCell('B6').value = 'LAPORAN LABA-RUGI'
  wsLaporan.getCell('B6').font = { name: 'Verdana', size: 12, bold: true }
  wsLaporan.getCell('B6').alignment = { horizontal: 'center' }
  wsLaporan.mergeCells('B7:E7')
  wsLaporan.getCell('B7').value = `${aum} - ${periodeLabel}`
  wsLaporan.getCell('B7').font = { name: 'Verdana', size: 9 }
  wsLaporan.getCell('B7').alignment = { horizontal: 'center' }
  for (let col = 2; col <= 5; col++) {
    wsLaporan.getCell(6, col).border = { top: { style: 'medium', color: { argb: warna.garis } } }
    wsLaporan.getCell(7, col).border = { bottom: { style: 'medium', color: { argb: warna.garis } } }
  }

  const styleReportSection = (row, label) => {
    wsLaporan.getCell(row, 2).value = label
    wsLaporan.getCell(row, 2).font = { name: 'Verdana', size: 9, bold: true, color: { argb: warna.hijauGelap } }
  }
  const writeReportAccounts = (accounts, startRow) => {
    accounts.forEach((akun, index) => {
      const row = startRow + index
      wsLaporan.getCell(row, 2).value = akun.nama
      wsLaporan.getCell(row, 3).value = akun.debet || null
      wsLaporan.getCell(row, 4).value = akun.kredit || null
    })
  }
  const styleReportTotal = (row, label, value, highlighted = false) => {
    wsLaporan.getCell(row, 2).value = label
    wsLaporan.getCell(row, 5).value = value
    for (let col = 2; col <= 5; col++) {
      const cell = wsLaporan.getCell(row, col)
      cell.font = { name: 'Verdana', size: 9, bold: true }
      if (highlighted) cell.fill = fill(warna.hijauMuda)
    }
  }

  styleReportSection(9, 'PENDAPATAN')
  writeReportAccounts(pendapatan, 10)
  styleReportTotal(13, 'Total Pendapatan', totalPendapatan)
  styleReportSection(14, 'PENGELUARAN')
  writeReportAccounts(pengeluaran, 15)
  styleReportTotal(32, 'Total Pengeluaran', totalPengeluaran)
  styleReportTotal(33, 'Laba/Rugi Kotor', labaRugiKotor, true)
  styleReportSection(34, 'PENDAPATAN/PENGELUARAN LAIN-LAIN')
  writeReportAccounts(lainLain, 35)
  styleReportTotal(38, 'Total', totalLainLain)
  styleReportTotal(39, 'Laba/Rugi Bersih', labaRugiBersih, true)

  ;[12, 31, 37].forEach(row => {
    for (let col = 3; col <= 5; col++) {
      wsLaporan.getCell(row, col).border = { bottom: { style: 'thin', color: { argb: 'FF000000' } } }
    }
  })
  for (let row = 9; row <= 39; row++) {
    wsLaporan.getRow(row).height = 18
    for (let col = 2; col <= 5; col++) {
      const cell = wsLaporan.getCell(row, col)
      cell.font = { ...cell.font, name: 'Verdana', size: 9 }
      cell.alignment = { vertical: 'middle', horizontal: col >= 3 ? 'right' : 'left' }
      if (col >= 3) cell.numFmt = '#,##0.00;[Red]-#,##0.00;""'
    }
  }
  wsLaporan.getCell('E33').font = { name: 'Verdana', size: 9, bold: true, color: { argb: labaRugiKotor < 0 ? warna.merah : 'FF000000' } }
  wsLaporan.getCell('E39').font = { name: 'Verdana', size: 9, bold: true, color: { argb: labaRugiBersih < 0 ? warna.merah : 'FF000000' } }

  // Trigger download di browser
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => window.URL.revokeObjectURL(url), 0)

  return { fileName, status: 'success' }
}

// Export ke PDF (hanya Laporan Laba-Rugi)
export const exportToPDF = async (dataTransaksi, aum, periode) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const { dataUntukLabaRugi } = useKeuangan()
  const periodeLabel = getPeriodeLabel(periode)

  const labaRugi = dataUntukLabaRugi(dataTransaksi, periodeLabel)
  const fileName = `Laporan Keuangan - ${aum} - ${periodeLabel}.pdf`

  const doc = new jsPDF()

  // 1. Kop Surat
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PIMPINAN CABANG MUHAMMADIYAH BERBAH', 105, 20, { align: 'center' })
  doc.setFontSize(12)
  doc.text(aum.toUpperCase(), 105, 27, { align: 'center' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Laporan Laba-Rugi - ${periodeLabel}`, 105, 34, { align: 'center' })

  doc.line(14, 38, 196, 38)

  const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

  // 2. Render Tabel
  const tableBody = []

  tableBody.push([{ content: labaRugi.pendapatanUtama.judul, styles: { fontStyle: 'bold' } }, ''])
  labaRugi.pendapatanUtama.items.forEach(i => tableBody.push(['  ' + i.nama, formatCurrency(i.jumlah)]))
  tableBody.push([{ content: 'Total Pendapatan', styles: { fontStyle: 'bold' } }, { content: formatCurrency(labaRugi.pendapatanUtama.total), styles: { fontStyle: 'bold' } }])

  tableBody.push([{ content: labaRugi.pengeluaranUtama.judul, styles: { fontStyle: 'bold' } }, ''])
  labaRugi.pengeluaranUtama.items.forEach(i => tableBody.push(['  ' + i.nama, formatCurrency(i.jumlah)]))
  tableBody.push([{ content: 'Total Pengeluaran', styles: { fontStyle: 'bold' } }, { content: formatCurrency(labaRugi.pengeluaranUtama.total), styles: { fontStyle: 'bold' } }])

  tableBody.push([{ content: 'Laba/Rugi Kotor', styles: { fontStyle: 'bold' } }, { content: formatCurrency(labaRugi.labaRugiKotor), styles: { fontStyle: 'bold' } }])

  tableBody.push([{ content: labaRugi.lainLain.judul, styles: { fontStyle: 'bold' } }, ''])
  labaRugi.lainLain.items.forEach(i => tableBody.push(['  ' + i.nama, formatCurrency(i.jumlah)]))
  tableBody.push([{ content: 'Total Lain-lain', styles: { fontStyle: 'bold' } }, { content: formatCurrency(labaRugi.lainLain.total), styles: { fontStyle: 'bold' } }])

  tableBody.push([{ content: 'Laba/Rugi Bersih', styles: { fontStyle: 'bold' } }, { content: formatCurrency(labaRugi.labaRugiBersih), styles: { fontStyle: 'bold' } }])

  autoTable(doc, {
    startY: 45,
    head: [['Keterangan', 'Jumlah']],
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [27, 94, 32] }, // #1B5E20
  })

  // 3. Footer & Tanda Tangan
  let finalY = doc.lastAutoTable.finalY + 20
  if (finalY + 45 > doc.internal.pageSize.getHeight() - 10) {
    doc.addPage()
    finalY = 25
  }
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  doc.setFontSize(10)
  doc.text(`Dicetak pada: ${today}`, 14, finalY)

  doc.text('Mengetahui,', 50, finalY + 15, { align: 'center' })
  doc.text('Ketua PCM Berbah', 50, finalY + 20, { align: 'center' })
  doc.text('(....................................)', 50, finalY + 45, { align: 'center' })

  doc.text('Bendahara Unit', 155, finalY + 20, { align: 'center' })
  doc.text('(....................................)', 155, finalY + 45, { align: 'center' })

  // 4. Trigger download
  doc.save(fileName)

  return { fileName, status: 'success' }
}
