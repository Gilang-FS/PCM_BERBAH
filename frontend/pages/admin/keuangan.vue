<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const userRole = ref('')
onMounted(() => {
  userRole.value = localStorage.getItem('user_role') || ''
})

// Form state
const form = ref({
  jenis: 'pemasukan' as 'pemasukan' | 'pengeluaran',
  tanggal: new Date().toISOString().split('T')[0],
  nominal: '',
  keterangan: '',
  aum: 'SD Muh 1'
})

const isSubmitting = ref(false)
const editingId = ref<string | null>(null) // null = mode tambah, string = mode edit

const aumList = ['SD Muh 1', 'SD Muh 2', 'SD Muh 3', 'SD Muh 4', 'SD Muh 5', 'SD Muh 6', 'SMP Muh', 'SMK Muh', 'Klinik']

// Data riwayat
const riwayat = ref([
  { id: '1', tanggal: '2026-08-15', keterangan: 'Pemasukan Zakat', jenis: 'pemasukan' as const, nominal: 500000, aum: 'SD Muh 1' },
  { id: '2', tanggal: '2026-08-14', keterangan: 'Pemasukan Infaq', jenis: 'pemasukan' as const, nominal: 1000000, aum: 'SMP Muh' },
  { id: '3', tanggal: '2026-08-13', keterangan: 'Pengeluaran Operasional', jenis: 'pengeluaran' as const, nominal: 250000, aum: 'SD Muh 1' },
  { id: '4', tanggal: '2026-08-12', keterangan: 'SPP Bulan Agustus', jenis: 'pemasukan' as const, nominal: 5000000, aum: 'SD Muh 3' },
  { id: '5', tanggal: '2026-08-10', keterangan: 'Pembelian ATK', jenis: 'pengeluaran' as const, nominal: 320000, aum: 'SMK Muh' },
])

const formatRupiah = (num: number) =>
  'Rp ' + new Intl.NumberFormat('id-ID').format(num)

const formatTanggal = (str: string) => {
  const d = new Date(str)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Submit: Tambah atau Simpan Edit
const submitInput = async () => {
  if (!form.value.nominal || !form.value.keterangan || !form.value.tanggal) return
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 300))

  if (editingId.value) {
    // Mode edit — update data yang sudah ada
    const index = riwayat.value.findIndex(r => r.id === editingId.value)
    if (index !== -1) {
      riwayat.value[index] = {
        id: editingId.value,
        tanggal: form.value.tanggal,
        keterangan: form.value.keterangan,
        jenis: form.value.jenis,
        nominal: Number(form.value.nominal),
        aum: form.value.aum
      }
    }
    editingId.value = null
  } else {
    // Mode tambah
    riwayat.value.unshift({
      id: Date.now().toString(),
      tanggal: form.value.tanggal,
      keterangan: form.value.keterangan,
      jenis: form.value.jenis,
      nominal: Number(form.value.nominal),
      aum: form.value.aum
    })
  }

  // Reset form
  form.value.nominal = ''
  form.value.keterangan = ''
  isSubmitting.value = false
}

// Edit: isi form dengan data yang dipilih
const startEdit = (item: any) => {
  editingId.value = item.id
  form.value.jenis = item.jenis
  form.value.tanggal = item.tanggal
  form.value.nominal = item.nominal.toString()
  form.value.keterangan = item.keterangan
  form.value.aum = item.aum
  // Scroll ke atas form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Batal edit
const cancelEdit = () => {
  editingId.value = null
  form.value.nominal = ''
  form.value.keterangan = ''
}

// Hapus
const showDeleteConfirm = ref<string | null>(null)

const deleteItem = (id: string) => {
  riwayat.value = riwayat.value.filter(r => r.id !== id)
  showDeleteConfirm.value = null
  // Jika sedang edit item yang dihapus, batalkan edit
  if (editingId.value === id) editingId.value = null
}
</script>

<template>
  <div class="max-w-xl mx-auto space-y-4 pb-10">

    <!-- Form Input Langsung -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-5 pt-5 pb-1 flex items-center justify-between">
        <h2 class="text-[15px] font-bold text-gray-800">
          {{ editingId ? 'Edit Data Keuangan' : 'Masukan Keuangan' }}
        </h2>
        <button
          v-if="editingId"
          @click="cancelEdit"
          class="text-[12px] text-gray-400 hover:text-gray-600 font-medium"
        >
          Batal edit
        </button>
      </div>

      <form @submit.prevent="submitInput" class="px-5 pb-5 pt-3 space-y-4">

        <!-- Jenis Toggle -->
        <div class="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            type="button"
            @click="form.jenis = 'pemasukan'"
            class="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200"
            :class="form.jenis === 'pemasukan'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-400 hover:text-gray-600'"
          >
            ↑ Pemasukan
          </button>
          <button
            type="button"
            @click="form.jenis = 'pengeluaran'"
            class="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200"
            :class="form.jenis === 'pengeluaran'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-400 hover:text-gray-600'"
          >
            ↓ Pengeluaran
          </button>
        </div>

        <!-- AUM (Superadmin) -->
        <div v-if="userRole === 'superadmin'" class="space-y-1">
          <label class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">AUM / Klinik</label>
          <select v-model="form.aum" class="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] text-gray-700 bg-gray-50/50">
            <option v-for="aum in aumList" :key="aum" :value="aum">{{ aum }}</option>
          </select>
        </div>

        <!-- Tanggal -->
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tanggal</label>
          <input type="date" v-model="form.tanggal" required class="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] text-gray-700 bg-gray-50/50" />
        </div>

        <!-- Nominal -->
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Nominal</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">Rp</span>
            <input type="number" v-model="form.nominal" min="0" required placeholder="0" class="w-full pl-10 pr-3.5 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] text-gray-700 bg-gray-50/50 placeholder-gray-300" />
          </div>
        </div>

        <!-- Keterangan -->
        <div class="space-y-1">
          <label class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Keterangan</label>
          <input type="text" v-model="form.keterangan" required placeholder="Masukkan Keterangan" class="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 focus:border-[#1B5E20] text-gray-700 bg-gray-50/50 placeholder-gray-300" />
        </div>

        <!-- Tombol Submit -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full py-3 rounded-xl text-[14px] font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
          :class="editingId
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/20 active:scale-[0.98]'
            : form.jenis === 'pemasukan'
              ? 'bg-[#0b4a2f] hover:bg-[#083623] text-white shadow-md shadow-green-900/20 active:scale-[0.98]'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/20 active:scale-[0.98]'"
        >
          <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          {{ isSubmitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Input' }}
        </button>
      </form>
    </div>

    <!-- Riwayat Input -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h2 class="text-[15px] font-bold text-gray-800">Riwayat Input</h2>
        <span class="text-[11px] text-gray-400 font-medium">{{ riwayat.length }} transaksi</span>
      </div>

      <div class="divide-y divide-gray-50">
        <div
          v-for="item in riwayat"
          :key="item.id"
          class="px-5 py-3.5 flex items-center gap-3 group relative"
          :class="editingId === item.id ? 'bg-blue-50/40' : 'hover:bg-gray-50/60'"
        >
          <!-- Icon -->
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            :class="item.jenis === 'pemasukan' ? 'bg-green-50' : 'bg-red-50'"
          >
            <svg
              class="w-4 h-4"
              :class="item.jenis === 'pemasukan' ? 'text-green-500' : 'text-red-400'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                :d="item.jenis === 'pemasukan' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'"
              />
            </svg>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-semibold text-gray-800 truncate">{{ item.keterangan }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">
              {{ formatTanggal(item.tanggal) }}
              <span v-if="userRole === 'superadmin'"> · {{ item.aum }}</span>
            </p>
          </div>

          <!-- Nominal & Actions -->
          <div class="text-right shrink-0">
            <p
              class="text-[14px] font-bold"
              :class="item.jenis === 'pemasukan' ? 'text-green-600' : 'text-red-500'"
            >
              {{ item.jenis === 'pemasukan' ? '+' : '-' }}{{ formatRupiah(item.nominal) }}
            </p>
            <div class="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="startEdit(item)"
                class="text-[10px] text-blue-500 hover:text-blue-700 font-medium"
              >
                Edit
              </button>
              <button
                @click="showDeleteConfirm = item.id"
                class="text-[10px] text-red-400 hover:text-red-600 font-medium"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>

        <div v-if="riwayat.length === 0" class="px-5 py-10 text-center text-gray-400 text-sm">
          Belum ada transaksi.
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteConfirm = null"></div>
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-[300px] overflow-hidden">
        <div class="p-6 text-center">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-[15px] font-bold text-gray-800 mb-1">Hapus data ini?</h3>
          <p class="text-[12px] text-gray-400">Data yang dihapus tidak bisa dikembalikan.</p>
          <div class="flex gap-3 mt-5">
            <button
              @click="showDeleteConfirm = null"
              class="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              @click="deleteItem(showDeleteConfirm!)"
              class="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
