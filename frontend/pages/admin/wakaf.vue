<script setup lang="ts">
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

const form = ref({
  id: '',
  jenisAset: '',
  lokasi: '',
  status: 'Aktif',
  keterangan: ''
})

// Data Dummy
const wakafData = ref([
  { id: '1', jenisAset: 'Tanah Kosong 200m²', lokasi: 'Jl. Raya Berbah, Tegaltirto', status: 'Aktif', keterangan: 'Cocok untuk dibangun panti asuhan' },
  { id: '2', jenisAset: 'Gedung Serbaguna', lokasi: 'Kalitirto, Berbah', status: 'Proses', keterangan: 'Sedang dalam proses balik nama sertifikat' },
  { id: '3', jenisAset: 'Lahan Pertanian 500m²', lokasi: 'Sendangtirto, Berbah', status: 'Aktif', keterangan: 'Disewakan untuk kas PCM' },
])

const openAddModal = () => {
  modalType.value = 'add'
  form.value = {
    id: '',
    jenisAset: '',
    lokasi: '',
    status: 'Aktif',
    keterangan: ''
  }
  isModalOpen.value = true
}

const openEditModal = (item: any) => {
  modalType.value = 'edit'
  form.value = { ...item }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveWakaf = () => {
  if (modalType.value === 'add') {
    wakafData.value.unshift({
      ...form.value,
      id: Date.now().toString()
    })
  } else {
    const index = wakafData.value.findIndex(w => w.id === form.value.id)
    if (index !== -1) wakafData.value[index] = { ...form.value }
  }
  closeModal()
}

const deleteWakaf = (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus data wakaf ini?')) {
    wakafData.value = wakafData.value.filter(item => item.id !== id)
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-gray-800">Kelola Aset Wakaf</h1>
        <p class="text-[13px] text-gray-400 mt-0.5">Pendataan dan manajemen aset persyarikatan.</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-[#1B5E20] hover:bg-[#145218] text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Aset
      </button>
    </div>

    <!-- Table Data -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Mobile View -->
      <div class="md:hidden divide-y divide-gray-50">
        <div v-for="item in wakafData" :key="item.id" class="p-4">
          <div class="flex justify-between items-start mb-2">
            <div>
              <p class="text-[14px] font-bold text-gray-800 leading-tight">{{ item.jenisAset }}</p>
              <p class="text-[11px] text-gray-400 mt-0.5">{{ item.lokasi }}</p>
            </div>
            <span
              class="text-[10px] font-medium px-2 py-0.5 rounded-full"
              :class="item.status === 'Aktif' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'"
            >
              {{ item.status }}
            </span>
          </div>
          <p class="text-[12px] text-gray-500 bg-gray-50 p-2 rounded mt-2">{{ item.keterangan }}</p>
          
          <div class="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-gray-50">
            <button @click="openEditModal(item)" class="text-blue-500 hover:text-blue-700 text-[12px] font-medium">Edit</button>
            <button @click="deleteWakaf(item.id)" class="text-red-500 hover:text-red-700 text-[12px] font-medium">Hapus</button>
          </div>
        </div>
      </div>

      <!-- Desktop View -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-[13px]">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr class="text-left text-[11px] text-gray-500 uppercase tracking-wider">
              <th class="px-4 py-3 font-semibold">Jenis Aset</th>
              <th class="px-4 py-3 font-semibold">Lokasi</th>
              <th class="px-4 py-3 font-semibold">Keterangan</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 font-semibold text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in wakafData" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-4 py-3.5 font-bold text-gray-800">{{ item.jenisAset }}</td>
              <td class="px-4 py-3.5 text-gray-600">{{ item.lokasi }}</td>
              <td class="px-4 py-3.5 text-gray-500">{{ item.keterangan }}</td>
              <td class="px-4 py-3.5">
                <span
                  class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  :class="item.status === 'Aktif' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'"
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-center">
                <div class="flex items-center justify-center gap-3">
                  <button @click="openEditModal(item)" class="text-blue-500 hover:text-blue-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button @click="deleteWakaf(item.id)" class="text-red-500 hover:text-red-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 class="text-[15px] font-bold text-gray-800">
            {{ modalType === 'add' ? 'Tambah Data Wakaf' : 'Edit Data Wakaf' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form @submit.prevent="saveWakaf" class="p-5 space-y-4">
          <div class="space-y-1">
            <label class="text-[12px] font-semibold text-gray-600">Jenis Aset</label>
            <input type="text" v-model="form.jenisAset" required placeholder="Contoh: Tanah Kosong 200m²" class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]" />
          </div>

          <div class="space-y-1">
            <label class="text-[12px] font-semibold text-gray-600">Lokasi</label>
            <input type="text" v-model="form.lokasi" required placeholder="Contoh: Jl. Raya Berbah, Tegaltirto" class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]" />
          </div>

          <div class="space-y-1">
            <label class="text-[12px] font-semibold text-gray-600">Status</label>
            <select v-model="form.status" required class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]">
              <option value="Aktif">Aktif / Berjalan</option>
              <option value="Proses">Dalam Proses Hukum / Sertifikasi</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-[12px] font-semibold text-gray-600">Keterangan / Informasi</label>
            <textarea v-model="form.keterangan" rows="3" placeholder="Informasi tambahan mengenai aset wakaf..." class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20] resize-none"></textarea>
          </div>

          <div class="pt-2">
            <button type="submit" class="w-full bg-[#1B5E20] hover:bg-[#145218] text-white py-2.5 rounded-lg text-[13px] font-bold shadow-sm transition-colors">
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
