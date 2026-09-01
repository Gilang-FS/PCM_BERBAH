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
  username: '',
  password: '',
  role: 'admin',
  aum: 'SD Muh 1'
})

// Data Dummy (9 Admin + 1 Superadmin)
const usersData = ref([
  { id: '1', username: 'superadmin', role: 'superadmin', aum: 'PCM Berbah (Pusat)' },
  { id: '2', username: 'admin_sd1', role: 'admin', aum: 'SD Muh 1' },
  { id: '3', username: 'admin_sd2', role: 'admin', aum: 'SD Muh 2' },
  { id: '4', username: 'admin_sd3', role: 'admin', aum: 'SD Muh 3' },
  { id: '5', username: 'admin_sd4', role: 'admin', aum: 'SD Muh 4' },
  { id: '6', username: 'admin_sd5', role: 'admin', aum: 'SD Muh 5' },
  { id: '7', username: 'admin_sd6', role: 'admin', aum: 'SD Muh 6' },
  { id: '8', username: 'admin_smp', role: 'admin', aum: 'SMP Muh' },
  { id: '9', username: 'admin_smk', role: 'admin', aum: 'SMK Muh' },
  { id: '10', username: 'admin_ranting', role: 'admin', aum: 'Ranting' },
])

const aumList = ['PCM Berbah (Pusat)', 'SD Muh 1', 'SD Muh 2', 'SD Muh 3', 'SD Muh 4', 'SD Muh 5', 'SD Muh 6', 'SMP Muh', 'SMK Muh', 'Ranting']

const openAddModal = () => {
  modalType.value = 'add'
  form.value = {
    id: '',
    username: '',
    password: '',
    role: 'admin',
    aum: aumList[1]
  }
  isModalOpen.value = true
}

const openEditModal = (item: any) => {
  modalType.value = 'edit'
  form.value = { ...item, password: '' } // Kosongkan password saat edit
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveUser = () => {
  if (modalType.value === 'add') {
    usersData.value.push({
      id: Date.now().toString(),
      username: form.value.username,
      role: form.value.role,
      aum: form.value.aum
    })
  } else {
    const index = usersData.value.findIndex(u => u.id === form.value.id)
    if (index !== -1) {
      usersData.value[index].username = form.value.username
      usersData.value[index].role = form.value.role
      usersData.value[index].aum = form.value.aum
    }
  }
  closeModal()
}

const deleteUser = (id: string) => {
  if (id === '1') {
    alert('Superadmin utama tidak boleh dihapus!')
    return
  }
  if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
    usersData.value = usersData.value.filter(item => item.id !== id)
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-gray-800">Pengguna</h1>
        <p class="text-[13px] text-gray-400 mt-0.5">9 admin AUM & 1 superadmin</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-[#1B5E20] hover:bg-[#145218] text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Tambah Akun
      </button>
    </div>

    <!-- Table Data -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Mobile View -->
      <div class="md:hidden divide-y divide-gray-50">
        <div v-for="item in usersData" :key="item.id" class="p-4 flex flex-col gap-2">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-[14px] font-bold text-gray-800 leading-tight">@{{ item.username }}</p>
              <p class="text-[11px] text-gray-500 font-medium mt-0.5">{{ item.aum }}</p>
            </div>
            <span
              class="text-[10px] font-medium px-2 py-0.5 rounded-full"
              :class="item.role === 'superadmin' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'"
            >
              {{ item.role === 'superadmin' ? 'Superadmin' : 'Admin' }}
            </span>
          </div>
          <div class="flex items-center justify-end gap-3 mt-2 pt-2 border-t border-gray-50">
            <button @click="openEditModal(item)" class="text-gray-400 hover:text-gray-600 transition-colors" title="Edit Pengguna">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button v-if="item.id !== '1'" @click="deleteUser(item.id)" class="text-red-400 hover:text-red-600 transition-colors" title="Hapus Pengguna">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop View -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-[13px]">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr class="text-left text-[11px] text-gray-500 uppercase tracking-wider">
              <th class="px-4 py-3 font-semibold">Username</th>
              <th class="px-4 py-3 font-semibold">Unit / AUM</th>
              <th class="px-4 py-3 font-semibold">Role</th>
              <th class="px-4 py-3 font-semibold text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in usersData" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-4 py-3.5 font-bold text-gray-800">@{{ item.username }}</td>
              <td class="px-4 py-3.5 text-gray-600">{{ item.aum }}</td>
              <td class="px-4 py-3.5">
                <span
                  class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  :class="item.role === 'superadmin' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'"
                >
                  {{ item.role === 'superadmin' ? 'Superadmin' : 'Admin' }}
                </span>
              </td>
              <td class="px-4 py-3.5 text-center">
                <div class="flex items-center justify-center gap-3">
                  <button @click="openEditModal(item)" class="text-gray-400 hover:text-gray-600 transition-colors" title="Edit Pengguna">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button v-if="item.id !== '1'" @click="deleteUser(item.id)" class="text-red-400 hover:text-red-600 transition-colors" title="Hapus Pengguna">
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
            {{ modalType === 'add' ? 'Tambah Akun' : 'Edit Akun' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form @submit.prevent="saveUser" class="p-5 space-y-4">
          <div class="space-y-1">
            <label class="text-[12px] font-semibold text-gray-600">Username</label>
            <input type="text" v-model="form.username" required placeholder="admin_sd1" class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]" />
          </div>

          <div class="space-y-1">
            <label class="text-[12px] font-semibold text-gray-600">
              Password <span v-if="modalType === 'edit'" class="text-gray-400 font-normal">(Kosongkan jika tidak ingin mengubah)</span>
            </label>
            <input type="password" v-model="form.password" :required="modalType === 'add'" placeholder="********" class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[12px] font-semibold text-gray-600">Role</label>
              <select v-model="form.role" required class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]">
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-[12px] font-semibold text-gray-600">Asal Unit / AUM</label>
              <select v-model="form.aum" required class="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-[#1B5E20] focus:border-[#1B5E20]">
                <option v-for="aum in aumList" :key="aum" :value="aum">{{ aum }}</option>
              </select>
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" class="w-full bg-[#1B5E20] hover:bg-[#145218] text-white py-2.5 rounded-lg text-[13px] font-bold shadow-sm transition-colors">
              Simpan Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
