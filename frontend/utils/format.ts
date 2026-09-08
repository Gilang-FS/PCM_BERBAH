// Kumpulan fungsi formatting yang dipakai di seluruh halaman.

export const formatRupiah = (num: unknown): string => {
  const value = Number(num)
  if (!Number.isFinite(value)) return '-'
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(value)
}

export const formatTanggal = (str: unknown): string => {
  const value = String(str)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '-'

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return '-'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const formatBulan = (str: unknown): string => {
  const value = String(str)
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return '-'

  const [year, month] = value.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
}
