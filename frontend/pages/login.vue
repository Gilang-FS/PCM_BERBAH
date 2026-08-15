<template>
  <div class="min-h-screen bg-[#EDEEE8] flex items-center justify-center">
    <div
      class="relative w-full max-w-[390px] min-h-screen bg-[#EDEEE8] overflow-hidden flex flex-col"
    >
      <!-- Blob kiri atas -->
      <svg
        class="absolute -top-10 -left-10 w-52 h-52 opacity-70"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#9DC4A0"
          d="M80,-120C100,-95,108,-65,115,-35C122,-5,128,25,118,52C108,79,82,103,52,118C22,133,-12,139,-44,128C-76,117,-106,89,-122,55C-138,21,-140,-19,-128,-54C-116,-89,-90,-119,-60,-130C-30,-141,0,-133,30,-120C60,-107,60,-145,80,-120Z"
          transform="translate(100 200)"
        />
      </svg>

      <!-- Lingkaran kecil kanan atas -->
      <div
        class="absolute top-12 right-8 w-10 h-10 rounded-full bg-[#B5CEB7] opacity-60"
      ></div>

      <!-- Blob kanan bawah -->
      <svg
        class="absolute -bottom-6 -right-6 w-48 h-48 opacity-60"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#9DC4A0"
          d="M70.5,-90.7C87.9,-74.5,96.3,-47.9,98.3,-21.8C100.3,4.3,95.9,30,83.1,50.3C70.3,70.6,49.1,85.5,25.8,91.3C2.5,97.1,-22.9,93.8,-44.2,82.1C-65.5,70.4,-82.7,50.3,-90.5,26.8C-98.3,3.3,-96.7,-23.6,-85.6,-45.1C-74.5,-66.6,-53.9,-82.7,-32,-91.2C-10.1,-99.7,13.1,-100.6,34.8,-96.4C56.5,-92.2,53.1,-107,70.5,-90.7Z"
          transform="translate(220 210)"
        />
      </svg>

      <!-- Konten utama -->
      <div
        class="relative z-10 flex flex-col items-center px-10 pt-20 pb-6 flex-1"
      >
        <!-- Logo Muhammadiyah -->
        <div class="w-20 h-20 mb-5">
          <img
            src="/images/logos/logo-muhammadiyah.png"
            alt="Logo Muhammadiyah"
            class="w-full h-full object-contain"
            onerror="
              this.style.display = 'none';
              this.nextElementSibling.style.display = 'flex';
            "
          />
          <!-- Fallback jika logo belum ada -->
          <div
            class="w-20 h-20 bg-[#1B5E20] rounded-full items-center justify-center text-white font-bold text-lg hidden"
            style="display: none"
          >
            ☘
          </div>
        </div>

        <!-- Judul -->
        <h1
          class="welcome-title text-[2.6rem] font-bold tracking-[0.22em] text-gray-800 uppercase mt-1 leading-none"
        >
          WELCOME
        </h1>
        <p
          class="text-[12.5px] text-gray-500 mt-3 text-center leading-relaxed tracking-wide"
        >
          Enter your credentials to access the portal
        </p>

        <!-- Form -->
        <form class="w-full mt-14 space-y-5" @submit.prevent="handleLogin">
          <!-- Username -->
          <div>
            <label
              class="block text-[10.5px] font-bold tracking-[0.18em] text-[#1B5E20] uppercase mb-2"
            >
              USERNAME
            </label>
            <div
              class="flex items-center bg-white border border-gray-100 rounded-2xl px-4 py-3.5 shadow-sm gap-3 transition-all focus-within:border-[#1B5E20] focus-within:shadow-md"
            >
              <!-- Mail icon -->
              <svg
                class="w-4 h-4 text-gray-300 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <input
                v-model="username"
                id="username"
                type="text"
                placeholder="institutional@pcmberbah.or.id"
                class="flex-1 text-sm text-gray-600 placeholder-gray-300 bg-transparent outline-none"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label
              class="block text-[10.5px] font-bold tracking-[0.18em] text-gray-500 uppercase mb-2"
            >
              Password
            </label>
            <div
              class="flex items-center bg-white border border-gray-100 rounded-2xl px-4 py-3.5 shadow-sm gap-3 transition-all focus-within:border-[#1B5E20] focus-within:shadow-md"
            >
              <!-- Lock icon -->
              <svg
                class="w-4 h-4 text-gray-300 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                v-model="password"
                id="password"
                type="password"
                placeholder="••••••••"
                class="flex-1 text-sm text-gray-600 placeholder-gray-400 bg-transparent outline-none"
              />
            </div>
          </div>

          <!-- Remember me + Forgot -->
          <div class="flex items-center justify-between pt-1">
            <label
              class="flex items-center gap-2 text-[11.5px] text-gray-400 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                v-model="remember"
                class="w-3.5 h-3.5 rounded border-gray-300 accent-[#1B5E20] cursor-pointer"
              />
              Remember me
            </label>
            <a
              href="#"
              class="text-[11.5px] text-[#1B5E20] font-semibold hover:underline"
              >Forgot password?</a
            >
          </div>

          <!-- Pesan error -->
          <transition name="fade">
            <div
              v-if="errorMessage"
              class="text-red-500 text-xs text-center bg-red-50 py-2.5 px-4 rounded-xl border border-red-100"
            >
              {{ errorMessage }}
            </div>
          </transition>

          <!-- Tombol Sign In -->
          <div class="pt-5">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-[#1B5E20] text-white py-4 rounded-full text-sm font-light tracking-[0.2em] hover:bg-[#145218] active:scale-[0.97] transition-all disabled:opacity-60 shadow-lg shadow-green-900/20"
            >
              <span
                v-if="isLoading"
                class="flex items-center justify-center gap-2"
              >
                <svg
                  class="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="white"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                signing in...
              </span>
              <span v-else>sign in</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="relative z-10 pb-10 text-center">
        <p class="text-[9.5px] text-gray-400 tracking-[0.25em] uppercase">
          PCM Berbah Institutional Portal
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

const router = useRouter();

const username = ref("");
const password = ref("");
const remember = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  // Simulasi network request (800ms)
  await new Promise((resolve) => setTimeout(resolve, 800));

  // MOCK — akan diganti dengan API call ke BE nanti
  if (
    (username.value === "superadmin" || username.value === "admin") &&
    password.value.length >= 4
  ) {
    localStorage.setItem("user_role", username.value);
    await router.push("/admin/dashboard");
  } else {
    errorMessage.value = "Username atau password yang Anda masukkan salah.";
  }

  isLoading.value = false;
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@300;400;500;600&display=swap");

* {
  font-family: "Inter", sans-serif;
}

.welcome-title {
  font-family: "Cormorant Garamond", serif;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
