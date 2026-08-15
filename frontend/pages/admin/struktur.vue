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
  nama: '',
  nbm: '',
  noWa: '',
  alamat: '',
  pekerjaan: '',
  email: '',
  ranting: 'Ranting Berbah'
})

// Data Dummy
const strukturData = ref([
  { id: '1', nama: 'Budi Santoso', nbm: '1234567', noWa: '081234567890', alamat: 'Jl. Merdeka No 1', pekerjaan: 'Guru', email: 'budi@example.com', ranting: 'Ranting Berbah' },
  { id: '2', nama: 'Siti Aminah', nbm: '7654321', noWa: '089876543210', alamat: 'Jl. Pemuda No 2', pekerjaan: 'Pegawai Swasta', email: 'siti@example.com', ranting: 'Ranting Sendangtirto' },
  { id: '3', nama: 'Ahmad Dahlan', nbm: '1122334', noWa: '085612345678', alamat: 'Jl. Ahmad Yani No 3', pekerjaan: 'Wiraswasta', email: 'ahmad@example.com', ranting: 'Ranting Kalitirto' },
])

const rantingList = ['Ranting Berbah', 'Ranting Sendangtirto', 'Ranting Kalitirto', 'Ranting Tegaltirto']

const openAddModal = () => {
  modalType.value = 'add'
  form.value = {
    id: '',
    nama: '',
    nbm: '',
    noWa: '',
    alamat: '',
    pekerjaan: '',
    email: '',
    ranting: rantingList[0]
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

const saveStruktur = () => {
  if (modalType.value === 'add') {
    strukturData.value.unshift({
      ...form.value,
      id: Date.now().toString()
    })
  } else {
    const index = strukturData.value.findIndex(s => s.id === form.value.id)
    if (index !== -1) strukturData.value[index] = { ...form.value }
  }
  closeModal()
}

const deleteStruktur = (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus data keanggotaan ini?')) {
    strukturData.value = strukturData.value.filter(item => item.id !== id)
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-gray-800">Kelola Data Keanggotaan</h1>
        <p class="text-[13px] text-gray-400 mt-0.5">Pendataan anggota Ranting dan PCM.</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-[#1B5E20] hover:bg-[#145218] text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Tambah Anggota
      </button>
    </div>

    <!-- Table Data -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Mobile View -->
      <div class="md:hidden divide-y divide-gray-50">
        <div v-for="item in strukturData" :key="item.id" class="p-4">
          <div class="flex justify-between items-start mb-2">
            <div>
              <p class="text-[14px] font-bold text-gray-800 leading-tight">{{ item.nama }}</p>
              <p class="text-[11px] text-gray-500 font-medium mt-0.5">NBM: {{ item.nbm }}</p>
            </div>
            <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              {{ item.ranting }}
            </span>
          </div>
          
          <div class="mt-3 space-y-1 text-[12px] text-gray-600">
            <div class="flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              {{ item.noWa }}
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {{ item.email }}
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {{ item.pekerjaan }}
            </div>
          </div>
          
          <div class="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-gray-50">
            <button @click="openEditModal(item)" class="text-blue-500 hover:text-blue-700 text-[12px] font-medium">Edit</button>
            <button @click="deleteStruktur(item.id)" class="text-red-500 hover:text-red-700 text-[12px] font-medium">Hapus</button>
          </div>
        </div>
      </div>

      <!-- Desktop View -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-[13px]">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr class="text-left text-[11px] text-gray-500 uppercase tracking-wider">
              <th class="px-4 py-3 font-semibold">Data Anggota</th>
              <th class="px-4 py-3 font-semibold">Kontak</th>
              <th class="px-4 py-3 font-semibold">Pekerjaan</th>
              <th class="px-4 py-3 font-semibold">Asal Ranting</th>
              <th class="px-4 py-3 font-semibold text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in strukturData" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-4 py-3.5">
                <p class="font-bold text-gray-800">{{ item.nama }}</p>
                <p class="text-[11px] text-gray-500 font-medium">NBM: {{ item.nbm }}</p>
              </td>
              <td class="px-4 py-3.5">
                <p class="text-gray-700">{{ item.noWa }}</p>
                <p class="text-[11px] text-gray-500">{{ item.email }}</p>
              </td>
              <td class="px-4 py-3.5 text-gray-600">{{ item.pekerjaan }}</td>
              <td class="px-4 py-3.5">
                <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {{ item.ranting }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-center">
                <div class="flex items-center justify-center gap-3">
                  <button @click="openEditModal(item)" class="text-blue-500 hover:text-blue-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button @click="deleteStruktur(item.id)" class="text-red-500 hover:text-red-700">
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
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div class="sticky top-0 z-10 px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 class="text-[15px] font-bold text-gray-800">
            {{ modalType === 'add' ? 'Tambah Data Keanggotaan' : 'Edit Data Keanggotaan' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form @submit.prevent="saveStruktur" class="p-5 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[12px] font-semibold text-gray-600">Nama Lengkap</label>
              <input type="text" v-model="form.nama" required placeholder="Budi Santoso" class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]" />
            </div>
            <div class="space-y-1">
              <label class="text-[12px] font-semibold text-gray-600">NBM (Nomor Baku)</label>
              <input type="text" v-model="form.nbm" required placeholder="1234567" class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[12px] font-semibold text-gray-600">Nomor WA</label>
              <input type="tel" v-model="form.noWa" required placeholder="081234567890" class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]" />
            </div>
            <div class="space-y-1">
              <label class="text-[12px] font-semibold text-gray-600">Email</label>
              <input type="email" v-model="form.email" required placeholder="budi@example.com" class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[12px] font-semibold text-gray-600">Pekerjaan</label>
              <input type="text" v-model="form.pekerjaan" required placeholder="Guru" class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]" />
            </div>
            <div class="space-y-1">
              <label class="text-[12px] font-semibold text-gray-600">Ranting Asal</label>
              <select v-model="form.ranting" required class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]">
                <option v-for="ranting in rantingList" :key="ranting" :value="ranting">{{ ranting }}</option>
              </select>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[12px] font-semibold text-gray-600">Alamat Lengkap</label>
            <textarea v-model="form.alamat" rows="2" required placeholder="Jl. Merdeka No. 1, Berbah..." class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20] resize-none"></textarea>
          </div>

          <div class="pt-4 border-t border-gray-100">
            <button type="submit" class="w-full bg-[#1B5E20] hover:bg-[#145218] text-white py-2.5 rounded-lg text-[13px] font-bold shadow-sm transition-colors">
              Simpan Data Anggota
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
