<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const router = useRouter()
const userRole = ref('')

onMounted(() => {
  const role = localStorage.getItem('user_role')
  if (role !== 'superadmin') {
    router.push('/admin/dashboard')
    return
  }
  userRole.value = role
})

// State Modal
const isModalOpen = ref(false)
const modalType = ref<'add' | 'edit'>('add')
const isSubmitting = ref(false)

const form = ref({
  id: '',
  jenisAset: '',
  lokasi: '',
  status: 'Aktif',
  nominal: '',
  image: '',
  keterangan: ''
})

// Data Dummy (Lebih kaya dengan gambar dan nominal)
const wakafData = ref([
  { 
    id: '1', 
    jenisAset: 'Tanah Kosong 200m²', 
    lokasi: 'Jl. Raya Berbah, Tegaltirto', 
    status: 'Aktif',
    nominal: 5000000,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop',
    keterangan: 'Rencana pembangunan panti asuhan anak yatim piatu cabang Berbah.' 
  },
  { 
    id: '2', 
    jenisAset: 'Gedung Serbaguna', 
    lokasi: 'Kalitirto, Berbah', 
    status: 'Proses',
    nominal: 25000000,
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&h=400&fit=crop',
    keterangan: 'Sedang dalam proses penyelesaian administrasi balik nama sertifikat wakaf di BPN.' 
  },
  { 
    id: '3', 
    jenisAset: 'Ambulans Umat', 
    lokasi: 'Klinik Muhammadiyah Berbah', 
    status: 'Aktif',
    nominal: 120000000,
    image: 'https://images.unsplash.com/photo-1588775005506-cc9c8491cbb1?w=600&h=400&fit=crop',
    keterangan: 'Kendaraan operasional untuk layanan kesehatan gratis bagi dhuafa.' 
  },
])

// Formatters
const formatRupiah = (num: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(num)

const openAddModal = () => {
  modalType.value = 'add'
  form.value = {
    id: '',
    jenisAset: '',
    lokasi: '',
    status: 'Aktif',
    nominal: '',
    image: '',
    keterangan: ''
  }
  isModalOpen.value = true
}

const openEditModal = (item: any) => {
  modalType.value = 'edit'
  form.value = { ...item, nominal: item.nominal.toString() }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveWakaf = async () => {
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 500)) // Simulasi loading

  const payload = {
    ...form.value,
    nominal: Number(form.value.nominal) || 0,
    // Jika tidak ada gambar yang diupload, beri placeholder bawaan
    image: form.value.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop'
  }

  if (modalType.value === 'add') {
    wakafData.value.unshift({ ...payload, id: Date.now().toString() })
  } else {
    const index = wakafData.value.findIndex(w => w.id === form.value.id)
    if (index !== -1) wakafData.value[index] = { ...payload }
  }
  
  isSubmitting.value = false
  closeModal()
}

const deleteWakaf = (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus data wakaf ini?')) {
    wakafData.value = wakafData.value.filter(item => item.id !== id)
  }
}

// Simulasi upload foto
const handlePhotoUpload = () => {
  alert('Simulasi: Dialog pemilihan file akan terbuka. Di tahap ini (frontend-only), kita akan menganggap foto berhasil diunggah.')
  // Dummy set image setelah pura-pura upload
  form.value.image = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-gray-800">Wakaf</h1>
        <p class="text-[13px] text-gray-400 mt-0.5">Kelola data dan galeri aset</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-[#1B5E20] hover:bg-[#145218] text-white px-4 py-2.5 rounded-xl text-[13px] font-bold shadow-md shadow-green-900/20 transition-all flex items-center justify-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
        Tambah Aset Baru
      </button>
    </div>

    <!-- Grid Aset Wakaf -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div 
        v-for="item in wakafData" 
        :key="item.id" 
        class="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden group hover:shadow-lg hover:border-green-100 transition-all flex flex-col"
      >
        <!-- Card Image -->
        <div class="relative h-48 overflow-hidden bg-gray-100">
          <img :src="item.image" :alt="item.jenisAset" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          
          <!-- Status Badge Overlay -->
          <div class="absolute top-3 right-3">
            <span
              class="text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm border border-white/20"
              :class="item.status === 'Aktif' ? 'bg-green-500/90 text-white' : 'bg-amber-500/90 text-white'"
            >
              {{ item.status }}
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-5 flex-1 flex flex-col">
          <h3 class="text-[16px] font-bold text-gray-900 leading-tight">{{ item.jenisAset }}</h3>
          
          <div class="flex items-start gap-1.5 mt-2">
            <svg class="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <p class="text-[12px] font-medium text-gray-500">{{ item.lokasi }}</p>
          </div>

          <div class="mt-4 mb-4 flex-1">
            <p class="text-[12px] text-gray-600 line-clamp-3 leading-relaxed">{{ item.keterangan }}</p>
          </div>

          <!-- Footer Nominal & Aksi -->
          <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Nilai / Terkumpul</p>
              <p class="text-[14px] font-bold text-green-600">{{ formatRupiah(item.nominal) }}</p>
            </div>
            
            <div class="flex items-center gap-3 pr-1">
              <button @click="openEditModal(item)" class="text-gray-400 hover:text-gray-600 transition-colors" title="Edit Data">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button @click="deleteWakaf(item.id)" class="text-red-500 hover:text-red-700 transition-colors" title="Hapus Data">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="wakafData.length === 0" class="col-span-full py-16 text-center bg-gray-50 rounded-[20px] border border-dashed border-gray-200">
        <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        <p class="text-[14px] font-semibold text-gray-500">Belum ada data aset wakaf</p>
        <p class="text-[12px] text-gray-400 mt-1">Klik tombol Tambah Aset Baru untuk mendata wakaf.</p>
      </div>
    </div>

    <!-- Modal Form (Slide Up / Fade In) -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div class="bg-white w-full max-w-lg rounded-t-[24px] sm:rounded-[24px] shadow-2xl overflow-hidden animate-slide-up sm:animate-zoom-in flex flex-col max-h-[90vh]">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h2 class="text-[16px] font-bold text-gray-800">
            {{ modalType === 'add' ? 'Tambah Aset Wakaf' : 'Edit Aset Wakaf' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-1 bg-white rounded-lg shadow-sm border border-gray-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form @submit.prevent="saveWakaf" class="p-5 overflow-y-auto space-y-4">
          <!-- Upload Area Dummy -->
          <div class="space-y-1.5">
            <label class="text-[12px] font-medium text-gray-600">Foto Aset Wakaf</label>
            <div 
              @click="handlePhotoUpload"
              class="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 hover:border-[#1B5E20]/30 transition-colors relative overflow-hidden"
            >
              <img v-if="form.image" :src="form.image" class="absolute inset-0 w-full h-full object-cover opacity-30" />
              <svg class="w-6 h-6 text-gray-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span class="text-[12px] font-semibold text-gray-500 relative z-10">{{ form.image ? 'Ubah Foto (Simulasi)' : 'Klik untuk Unggah Foto' }}</span>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[12px] font-medium text-gray-600">Nama / Jenis Aset</label>
            <input type="text" v-model="form.jenisAset" required placeholder="Contoh: Tanah Kosong 200m²" class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[12px] font-medium text-gray-600">Lokasi Aset</label>
            <input type="text" v-model="form.lokasi" required placeholder="Contoh: Jl. Raya Berbah, Tegaltirto" class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[12px] font-medium text-gray-600">Status</label>
              <select v-model="form.status" required class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50">
                <option value="Aktif">Aktif / Berjalan</option>
                <option value="Proses">Dalam Proses Hukum</option>
              </select>
            </div>
            
            <div class="space-y-1.5">
              <label class="text-[12px] font-medium text-gray-600">Nilai (Rp)</label>
              <input type="number" v-model="form.nominal" min="0" placeholder="0" class="w-full px-3.5 py-2.5 text-[13px] font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-800 bg-gray-50/50 placeholder-gray-300" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[12px] font-medium text-gray-600">Keterangan / Deskripsi</label>
            <textarea v-model="form.keterangan" rows="3" placeholder="Informasi tambahan, tujuan wakaf, dsb..." class="w-full px-3.5 py-2.5 text-[13px] font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/30 text-gray-700 bg-gray-50/50 resize-none"></textarea>
          </div>

          <div class="pt-4 pb-2">
            <button type="submit" :disabled="isSubmitting" class="w-full py-3 rounded-xl text-[14px] font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 bg-[#1B5E20] hover:bg-[#124016] text-white shadow-md shadow-green-900/20 disabled:opacity-50">
              <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Data Wakaf' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
