<template>
  <div class="py-4 sm:py-6 lg:py-8">
    <!-- Hero berdiri terpisah agar foto memiliki ruang visual yang lebih luas. -->
    <section class="mx-auto w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-[10px] bg-[#20241f] md:w-[calc(100%-4rem)] lg:w-[calc(100%-6rem)] xl:w-full" aria-label="Sorotan PCM Berbah">
      <div class="relative h-[360px] overflow-hidden sm:h-[500px] lg:h-[600px]">
        <!-- Slider Images -->
        <div
          class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          v-for="(slide, index) in sliderImages"
          :key="index"
          :class="currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'"
          :aria-hidden="currentSlide !== index"
        >
          <img :src="slide.src" :alt="slide.alt" width="1600" height="900" class="h-full w-full object-cover object-center" />
          <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/10"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10"></div>
        </div>

        <!-- Slider Content -->
        <div class="absolute inset-0 z-20 flex items-end pb-14 pl-7 pr-20 sm:px-12 sm:pb-16 lg:px-16 lg:pb-20">
          <div class="max-w-2xl border-l-4 border-[#1B5E20] pl-5 text-left sm:pl-7">
            <p class="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75 sm:text-xs">Profil Persyarikatan</p>
            <h1 class="public-hero-title break-words font-serif text-[27px] font-bold leading-[1.15] text-white sm:text-[40px] lg:text-[48px]">
              Pimpinan Cabang<br />Muhammadiyah Berbah
            </h1>
            <p class="mt-4 max-w-lg text-[14px] leading-relaxed text-white/85 sm:text-[16px]">
              Gerakan Islam berkemajuan untuk masyarakat Berbah.
            </p>
          </div>
        </div>

        <!-- Slider Controls (Dots) -->
        <div class="absolute right-5 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2.5 sm:right-7">
          <button
            v-for="(_, index) in sliderImages"
            :key="'dot-'+index"
            type="button"
            @click="currentSlide = index"
            class="relative h-6 w-6 rounded-full after:absolute after:left-1/2 after:top-1/2 after:h-2.5 after:w-2.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:border after:border-white/40 after:transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/40"
            :class="currentSlide === index ? 'after:bg-[#1B5E20]' : 'after:bg-white/45 hover:after:bg-white/75'"
            :aria-label="`Tampilkan foto ${index + 1}`"
            :aria-current="currentSlide === index ? 'true' : undefined"
          ></button>
          <button
            type="button"
            class="mt-2 flex h-8 w-8 -translate-x-[11px] items-center justify-center rounded-full border border-white/50 bg-black/25 text-white transition-colors hover:bg-black/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            :aria-label="isSliderPaused ? 'Putar slider foto' : 'Jeda slider foto'"
            :aria-pressed="isSliderPaused"
            @click="toggleSlider"
          >
            <svg v-if="isSliderPaused" class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            <svg v-else class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z" /></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Seluruh informasi utama tetap berada dalam satu bingkai institusional. -->
    <div class="mx-auto mt-6 w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-[10px] border border-[#dedbd1] bg-white md:mt-8 md:w-[calc(100%-4rem)] lg:w-[calc(100%-6rem)] xl:w-full">

    <!-- PROFIL & VISI MISI -->
    <section class="bg-white py-12 md:py-14 lg:py-16" aria-label="Profil serta visi dan misi PCM Berbah">
      <div class="mx-auto px-6 md:px-10 lg:px-14">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <div class="mb-5 border-b border-[#dedbd1] pb-4">
              <h2 id="profil-singkat-title" class="public-section-title text-gray-900">Profil Singkat</h2>
            </div>
            <p class="mb-4 text-left text-[16px] leading-relaxed text-gray-700 sm:text-justify">
              Pimpinan Cabang Muhammadiyah (PCM) Berbah merupakan representasi gerakan dakwah Islam amar ma'ruf nahi munkar di tingkat Kapanewon (Kecamatan) Berbah yang bergerak langsung di bawah koordinasi Pimpinan Daerah Muhammadiyah (PDM) Sleman. Sebagai pilar persyarikatan, organisasi ini berkomitmen penuh untuk menghidupkan syiar Islam yang murni, inklusif, dan berkemajuan di tengah masyarakat.
            </p>
            <p class="mb-4 text-left text-[16px] leading-relaxed text-gray-700 sm:text-justify">
              Melalui pendekatan dakwah kultural yang adaptif, PCM Berbah fokus pada penguatan nilai-nilai keagamaan, pembinaan moral, serta peningkatan kepedulian sosial guna mewujudkan tatanan masyarakat yang religius, mandiri, dan berbudaya luhur.
            </p>
            <p class="text-left text-[16px] leading-relaxed text-gray-700 sm:text-justify">
              Dengan semangat kolaborasi yang kuat bersama elemen pemerintah dan seluruh warga persyarikatan, PCM Berbah terus bergerak aktif menjadi motor penggerak pembangunan umat demi terwujudnya wilayah Berbah yang berkemajuan. Komitmen ini salah satunya diwujudkan melalui Amal Usaha Muhammadiyah (AUM) unggulan di bidang pendidikan, seperti SD Muhammadiyah Semoya dan SMP Muhammadiyah 1 Berbah.
            </p>
          </div>
          <div class="border-[#d8d4c9] pt-10 lg:border-l lg:pl-12 lg:pt-0">
            <div class="mb-5 border-b border-[#dedbd1] pb-4">
              <h2 id="visi-misi-title" class="public-section-title text-gray-900">Visi & Misi</h2>
            </div>
            <div>
              <h3 class="mb-3 text-[12px] font-bold uppercase tracking-[0.16em] text-[#1B5E20]">Visi</h3>
              <p class="font-serif text-xl leading-[1.4] text-gray-800">
                "Terwujudnya masyarakat Islam yang sebenar-benarnya di wilayah Kapanewon Berbah, yang religius, maju, berdaya saing, serta berkepribadian islami."
              </p>
            </div>
            <div class="mt-10">
              <h3 class="mb-5 text-[12px] font-bold uppercase tracking-[0.16em] text-[#1B5E20]">Misi</h3>
              <ol class="flex flex-col gap-7 border-none border-transparent">
                <li class="flex items-start gap-4 border-none border-transparent">
                  <span class="mt-0.5 flex-none text-[16px] font-extrabold tabular-nums text-[#1B5E20]">01</span>
                  <span class="text-[16px] leading-relaxed text-gray-700"><strong class="font-semibold text-gray-900">Peneguhan Ideologi:</strong> Menguatkan paham Islam yang murni dan ideologi Muhammadiyah di seluruh lini organisasi.</span>
                </li>
                <li class="flex items-start gap-4 border-none border-transparent">
                  <span class="mt-0.5 flex-none text-[16px] font-extrabold tabular-nums text-[#1B5E20]">02</span>
                  <span class="text-[16px] leading-relaxed text-gray-700"><strong class="font-semibold text-gray-900">Dakwah Berkemajuan:</strong> Menyebarluaskan risalah Islam berkemajuan yang ramah, damai, dan solutif bagi masyarakat.</span>
                </li>
                <li class="flex items-start gap-4 border-none border-transparent">
                  <span class="mt-0.5 flex-none text-[16px] font-extrabold tabular-nums text-[#1B5E20]">03</span>
                  <span class="text-[16px] leading-relaxed text-gray-700"><strong class="font-semibold text-gray-900">Penguatan Akar Rumput:</strong> Memperkuat dan memperluas basis keanggotaan umat hingga tingkat Pimpinan Ranting Muhammadiyah (PRM) di kelurahan/desa.</span>
                </li>
                <li class="flex items-start gap-4 border-none border-transparent">
                  <span class="mt-0.5 flex-none text-[16px] font-extrabold tabular-nums text-[#1B5E20]">04</span>
                  <span class="text-[16px] leading-relaxed text-gray-700"><strong class="font-semibold text-gray-900">Pengembangan Amal Usaha:</strong> Mengoptimalkan pelayanan dan mutu Amal Usaha Muhammadiyah (AUM), baik di sektor pendidikan, kesehatan, maupun sosial.</span>
                </li>
                <li class="flex items-start gap-4 border-none border-transparent">
                  <span class="mt-0.5 flex-none text-[16px] font-extrabold tabular-nums text-[#1B5E20]">05</span>
                  <span class="text-[16px] leading-relaxed text-gray-700"><strong class="font-semibold text-gray-900">Gerakan Ekonomi:</strong> Membangun kemandirian organisasi dengan mengembangkan unit ekonomi dan melibatkan pelaku UMKM lokal.</span>
                </li>
                <li class="flex items-start gap-4 border-none border-transparent">
                  <span class="mt-0.5 flex-none text-[16px] font-extrabold tabular-nums text-[#1B5E20]">06</span>
                  <span class="text-[16px] leading-relaxed text-gray-700"><strong class="font-semibold text-gray-900">Dakwah Generasi Muda:</strong> Mengintensifkan metode dakwah yang adaptif bagi kalangan milenial dan generasi muda melalui organisasi otonom (Ortom).</span>
                </li>
                <li class="flex items-start gap-4 border-none border-transparent">
                  <span class="mt-0.5 flex-none text-[16px] font-extrabold tabular-nums text-[#1B5E20]">07</span>
                  <span class="text-[16px] leading-relaxed text-gray-700"><strong class="font-semibold text-gray-900">Kaderisasi & Reformasi Organisasi:</strong> Melakukan regenerasi kepengurusan secara konsisten serta mereformasi tata kelola organisasi agar lebih adaptif memanfaatkan teknologi digital.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SAMBUTAN KETUA -->
    <section class="bg-white" aria-labelledby="sambutan-ketua-title">
      <div class="mx-6 py-12 md:mx-10 md:py-14 lg:mx-14 lg:py-16">
        <div class="grid grid-cols-1 items-stretch gap-8 md:grid-cols-12 md:gap-10 lg:gap-12">
          <div class="mx-auto w-full max-w-[380px] md:col-span-5 md:h-full md:max-w-none lg:col-span-5">
            <div class="relative aspect-[3/4] overflow-hidden rounded-[8px] border border-[#d8d4c9] bg-[#f7f6f1] shadow-sm md:h-full md:min-h-[560px] md:aspect-auto lg:min-h-[600px]">
              <img src="/images/ketua.png" alt="H. Ahmad Muhajir Hanifi - Ketua PCM Berbah" width="900" height="1200" loading="lazy" class="absolute inset-0 h-full w-full object-cover object-top" />
              <div class="-z-10 absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <svg class="mb-4 h-24 w-24 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                <span class="text-[13px] font-bold uppercase tracking-widest text-gray-500">Foto Ketua</span>
              </div>
            </div>
          </div>
            <div class="min-w-0 md:col-span-7 lg:col-span-7">
              <div class="mb-5 border-b border-[#dedbd1] pb-4">
                <h2 id="sambutan-ketua-title" class="public-section-title text-[#252b28]">Sambutan Ketua</h2>
              </div>
              <div class="space-y-4 text-left text-[16px] leading-relaxed text-gray-700 sm:text-justify">
                <p class="text-left"><i>Assalamu'alaikum Warahmatullahi Wabarakatuh,</i></p>
                <p>Puji syukur ke hadirat Allah SWT atas segala limpahan rahmat dan karunia-Nya. Shalawat dan salam senantiasa tercurah kepada junjungan kita, Nabi Muhammad SAW, beserta keluarga, sahabat, dan umatnya yang setia hingga akhir zaman.</p>
                <p>Selamat datang di situs resmi Pimpinan Cabang Muhammadiyah (PCM) Berbah. Di era digital ini, kami menyadari pentingnya keterbukaan informasi dan kemudahan akses bagi seluruh warga persyarikatan maupun masyarakat umum. Situs ini hadir sebagai wujud nyata komitmen kami untuk berdakwah secara inklusif, profesional, dan mengikuti perkembangan zaman.</p>
                <p>Melalui wadah digital ini, kami berharap dapat menyajikan informasi terkait program kerja, layanan umat, serta berbagai aktivitas dakwah yang dijalankan oleh PCM Berbah. Mari bersama-sama bersinergi mewujudkan masyarakat Islam yang sebenar-benarnya.</p>
                <p class="text-left"><i>Nasrun minallah wa fathun qariib.<br/>Wassalamu'alaikum Warahmatullahi Wabarakatuh.</i></p>
                <div class="mt-8 border-t border-gray-100 pt-5 text-left">
                  <p class="text-lg font-bold text-gray-900">H. Ahmad Muhajir Hanifi</p>
                  <p class="mt-1 text-sm text-gray-500">Ketua PCM Berbah Periode 2026/2027</p>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>

    <!-- 4 PILAR DAKWAH -->
    <section class="bg-white" aria-labelledby="pilar-dakwah-title">
      <div class="mx-6 py-12 md:mx-10 md:py-14 lg:mx-14 lg:py-16">
        <div class="mb-10 border-b border-[#dedbd1] pb-4 text-center">
          <h2 id="pilar-dakwah-title" class="public-section-title public-section-title--center text-gray-900">4 Pilar Gerakan Muhammadiyah Berbah</h2>
        </div>

        <div class="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:gap-x-12 lg:gap-y-14">
          <!-- Pilar 1 -->
          <div>
            <div class="mb-5 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[10px] border border-[#d8d4c9] bg-[#f3f1ea] text-[12px] font-bold uppercase tracking-[0.12em] text-gray-500" role="img" aria-label="Placeholder foto bidang Keagamaan">
              Foto Keagamaan
            </div>
            <div class="flex items-center gap-3">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-black text-[11px] font-black leading-none tabular-nums text-black">01</span>
              <h3 class="text-lg font-bold leading-tight text-gray-900">Gerakan keagamaan</h3>
            </div>
            <div class="my-4 h-px bg-[#1B5E20]" aria-hidden="true"></div>
            <p class="text-[14px] leading-relaxed text-gray-600">Pembinaan cabang, ranting, serta kemakmuran masjid/musholla sebagai pusat gerakan dakwah kultural.</p>
          </div>
          <!-- Pilar 2 -->
          <div>
            <div class="mb-5 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[10px] border border-[#d8d4c9] bg-[#f3f1ea] text-[12px] font-bold uppercase tracking-[0.12em] text-gray-500" role="img" aria-label="Placeholder foto bidang Pendidikan">
              Foto Pendidikan
            </div>
            <div class="flex items-center gap-3">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-black text-[11px] font-black leading-none tabular-nums text-black">02</span>
              <h3 class="text-lg font-bold leading-tight text-gray-900">Gerakan pendidikan</h3>
            </div>
            <div class="my-4 h-px bg-[#1B5E20]" aria-hidden="true"></div>
            <p class="text-[14px] leading-relaxed text-gray-600">Pengelolaan sekolah, madrasah, dan lembaga pendidikan (Dikdasmen) untuk mencetak generasi cerdas dan berakhlak mulia.</p>
          </div>
          <!-- Pilar 3 -->
          <div>
            <div class="mb-5 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[10px] border border-[#d8d4c9] bg-[#f3f1ea] text-[12px] font-bold uppercase tracking-[0.12em] text-gray-500" role="img" aria-label="Placeholder foto bidang Kesehatan dan Sosial">
              Foto Kesehatan & Sosial
            </div>
            <div class="flex items-center gap-3">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-black text-[11px] font-black leading-none tabular-nums text-black">03</span>
              <h3 class="text-lg font-bold leading-tight text-gray-900">Gerakan kesehatan dan sosial</h3>
            </div>
            <div class="my-4 h-px bg-[#1B5E20]" aria-hidden="true"></div>
            <p class="text-[14px] leading-relaxed text-gray-600">Pelayanan umat melalui panti asuhan, santunan dhuafa, Lazismu, dan pembinaan layanan kesehatan masyarakat (PKU).</p>
          </div>
          <!-- Pilar 4 -->
          <div>
            <div class="mb-5 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[10px] border border-[#d8d4c9] bg-[#f3f1ea] text-[12px] font-bold uppercase tracking-[0.12em] text-gray-500" role="img" aria-label="Placeholder foto bidang Ekonomi Masyarakat">
              Foto Ekonomi Masyarakat
            </div>
            <div class="flex items-center gap-3">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-black text-[11px] font-black leading-none tabular-nums text-black">04</span>
              <h3 class="text-lg font-bold leading-tight text-gray-900">Gerakan ekonomi masyarakat</h3>
            </div>
            <div class="my-4 h-px bg-[#1B5E20]" aria-hidden="true"></div>
            <p class="text-[14px] leading-relaxed text-gray-600">Pemberdayaan ekonomi kerakyatan dan pengelolaan wakaf produktif untuk kemandirian finansial persyarikatan.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- KONTAK & PETA -->
    <section class="bg-white" aria-labelledby="contact-title">
      <div class="mx-6 py-12 md:mx-10 md:py-14 lg:mx-14 lg:py-16">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div class="mb-5 border-b border-[#dedbd1] pb-4">
              <h2 id="contact-title" class="public-section-title text-gray-900">Informasi Kontak</h2>
            </div>
            <p class="text-gray-600 mb-8 leading-relaxed">
              Silakan hubungi kami untuk informasi lebih lanjut mengenai program, kegiatan, layanan donasi, atau kemitraan dengan PCM Berbah.
            </p>

            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="w-8 h-8 border border-[#d8d4c9] flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-[#1B5E20]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <div>
                  <p class="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-1">Sekretariat</p>
                  <p class="text-gray-600 text-[15px] leading-relaxed">
                    Jl. Tegal Sari, Krikilan, Tegaltirto,<br/>
                    Berbah, Sleman, DI Yogyakarta 55573
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-8 h-8 border border-[#d8d4c9] flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-[#1B5E20]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
                <div>
                  <p class="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-1">Telepon / WA</p>
                  <p class="text-gray-600 text-[15px] leading-relaxed">(0722) 333 5535</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-8 h-8 border border-[#d8d4c9] flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-[#1B5E20]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p class="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-1">Email</p>
                  <p class="text-gray-600 text-[15px] leading-relaxed">info@pcmberbah.com</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Peta lokasi -->
          <div class="bg-gray-200 h-64 md:h-80 lg:h-[500px] relative overflow-hidden border border-[#d8d4c9]">
             <iframe src="https://www.google.com/maps?q=Kantor%20PCM%20Berbah%20%28Muhammadiyah%20Berbah%29&z=17&output=embed" title="Lokasi Kantor PCM Berbah (Muhammadiyah Berbah)" class="absolute inset-0 w-full h-full border-0" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>
    </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({ layout: 'home' })

// Slider Logic
const sliderImages = [
  { src: '/images/musycab_hero.jpg', alt: 'Musyawarah Cabang Muhammadiyah Berbah' },
  { src: '/images/hero-1.png', alt: 'Kegiatan Pimpinan Cabang Muhammadiyah Berbah' },
  { src: '/images/hero-2.png', alt: 'Pengurus Pimpinan Cabang Muhammadiyah Berbah' }
]
const currentSlide = ref(0)
const isSliderPaused = ref(false)
let slideInterval = null

const stopSlider = () => {
  if (!slideInterval) return
  clearInterval(slideInterval)
  slideInterval = null
}

const startSlider = () => {
  if (slideInterval || document.hidden || isSliderPaused.value) return
  slideInterval = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % sliderImages.length
  }, 4000)
}

const toggleSlider = () => {
  isSliderPaused.value = !isSliderPaused.value
  if (isSliderPaused.value) stopSlider()
  else startSlider()
}

const handleVisibilityChange = () => {
  if (document.hidden) stopSlider()
  else startSlider()
}

onMounted(() => {
  isSliderPaused.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  startSlider()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopSlider()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>
