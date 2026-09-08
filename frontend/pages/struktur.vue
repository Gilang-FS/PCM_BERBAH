<template>
  <div class="flex flex-col">
    <!-- BOX 1: HERO SECTION -->
    <div class="bg-white overflow-hidden">
      <section class="px-6 pb-6 pt-12 md:px-10 md:pb-8 md:pt-14 lg:px-14 lg:pb-10 lg:pt-16" aria-labelledby="structure-page-title">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <!-- Left: Text -->
          <div class="max-w-xl order-2 lg:order-1">
            <h1
              id="structure-page-title"
               class="public-page-title mb-6 border-l-4 border-[#1B5E20] pl-4 text-[#244C35] sm:pl-5"
            >
              Struktur Organisasi PCM Berbah
            </h1>

            <p class="max-w-md text-[16px] leading-relaxed text-[#667069]">
              Susunan pimpinan dan pembagian tugas Pimpinan Cabang Muhammadiyah Berbah.
            </p>
          </div>

          <!-- Right: Images -->
          <div class="relative mx-auto h-[260px] w-full max-w-[520px] sm:h-[340px] lg:mx-0 lg:h-[410px] order-1 lg:order-2">
            <!-- Back Image -->
            <div class="absolute right-0 top-0 w-[84%] overflow-hidden rounded-[10px] border-4 border-white bg-gray-100 shadow-[0_8px_24px_rgba(31,41,36,0.10)] sm:border-[6px]">
              <img
                src="/images/hero-2.png"
                alt="Pengurus Muhammadiyah Berbah"
                width="1200"
                height="900"
                loading="lazy"
                class="aspect-[4/3] h-full w-full object-cover object-center"
              />
            </div>

            <!-- Front Image -->
            <div class="absolute bottom-0 left-0 z-10 w-[64%] overflow-hidden rounded-[10px] border-4 border-white bg-gray-100 shadow-[0_12px_30px_rgba(31,41,36,0.16)] sm:w-[66%] sm:border-[6px]">
              <img
                src="/images/hero-1.png"
                alt="Musyawarah Cabang Muhammadiyah Berbah"
                width="1200"
                height="900"
                loading="lazy"
                class="aspect-[4/3] h-full w-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- BOX 2: MEMBERS -->
    <div class="bg-white overflow-hidden">

      <!-- Daftar Anggota -->
      <section class="mx-6 border-t border-[#d8d4c9] pb-12 pt-8 md:mx-10 md:pb-14 md:pt-10 lg:mx-14 lg:pb-16 lg:pt-10">
        <!-- Header: Judul -->
        <div class="mb-6 border-b border-[#dedbd1] pb-4">
          <p class="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#144a18]">Periode 2026/2027</p>
          <h2 class="public-section-title text-[#252b28]">Susunan Pengurus PCM Berbah</h2>
        </div>

        <!-- Table Desktop -->
      <div class="hidden overflow-hidden border border-[#d8d4c9] md:block">
        <table class="w-full border-collapse text-left text-[14px] text-[#3f4943]">
          <caption class="sr-only">Susunan Pengurus PCM Berbah periode 2026/2027</caption>
          <thead>
            <tr class="bg-[#303030] text-[#F7F5EE]">
              <th scope="col" class="w-14 border-r border-white/10 px-4 py-3 text-center text-[13px] font-semibold">No</th>
              <th scope="col" class="border-r border-white/10 px-5 py-3 text-[13px] font-semibold">Nama lengkap</th>
              <th scope="col" class="border-r border-white/10 px-5 py-3 text-[13px] font-semibold">Jabatan</th>
              <th scope="col" class="w-32 px-5 py-3 text-[13px] font-semibold">NBM</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(member, index) in members" :key="index" class="border-b border-[#e5e1d7] last:border-b-0" :class="index % 2 === 0 ? 'bg-white' : 'bg-[#f8f7f2]'">
              <td class="border-r border-[#e5e1d7] px-4 py-3 text-center text-[#788078]">{{ index + 1 }}</td>
              <td class="border-r border-[#e5e1d7] px-5 py-3 font-semibold text-[#27302B]">{{ member.nama }}</td>
              <td class="border-r border-[#e5e1d7] px-5 py-3">
                <div class="font-semibold text-[#244C35]">{{ member.jabatanUtama }}</div>
                <div v-if="member.bidangTanggungJawab" class="mt-0.5 text-[13px] leading-snug text-[#788078]">{{ member.bidangTanggungJawab }}</div>
              </td>
              <td class="px-5 py-3 tabular-nums text-[#667069]">{{ member.nbm || "-" }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- List Mobile -->
      <div class="border-t border-[#89A995] md:hidden">
        <div v-for="(member, index) in members" :key="index" class="grid grid-cols-[2rem_1fr] gap-3 border-b border-[#dedbd1] py-5">
          <span class="pt-0.5 text-[12px] font-semibold tabular-nums text-[#89A995]">{{ String(index + 1).padStart(2, '0') }}</span>
          <div>
            <p class="text-[16px] font-semibold leading-snug text-[#27302B]">{{ member.nama }}</p>
            <p class="mt-1 text-[14px] leading-snug text-[#244C35]">
              <span class="font-semibold">{{ member.jabatanUtama }}</span><span v-if="member.bidangTanggungJawab" class="text-[#667069]"> · {{ member.bidangTanggungJawab }}</span>
            </p>
            <p class="mt-2 text-[12px] tabular-nums text-[#89908b]">NBM {{ member.nbm || "-" }}</p>
          </div>
        </div>
      </div>
    </section>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "default",
});

useHead({
  title: "Struktur Organisasi | PCM Berbah",
  meta: [
    {
      name: "description",
      content: "Susunan pimpinan dan pembagian tugas Pimpinan Cabang Muhammadiyah Berbah.",
    },
  ],
});

const members = [
  {
    nama: "H. Ahmad Muhajir Hanifi",
    nbm: "772 781",
    jabatanUtama: "Ketua",
  },
  {
    nama: "Dadi Nurhaedi, S.Ag., M.Si.",
    nbm: "801 756",
    jabatanUtama: "Wakil Ketua I",
    bidangTanggungJawab: "Kader, Tabligh dan Dikdas",
  },
  {
    nama: "Prof. Dr. H. Ahmad Nurmandi, M.Sc.",
    nbm: "713 214",
    jabatanUtama: "Wakil Ketua II",
    bidangTanggungJawab: "PKU, Pelayanan Sosial, Ekonomi & Pemberdayaan Masyarakat, Wakaf & Kehartabendaan",
  },
  {
    nama: "M. Yasin Nuryanto, S.T.",
    nbm: "800 139",
    jabatanUtama: "Sekretaris",
  },
  {
    nama: "H. Lilik Nugraharja, S.Tp., M.Eng.",
    nbm: "749 233",
    jabatanUtama: "Bendahara I",
  },
  {
    nama: "Saiful Rijal, S.H., M.M.",
    nbm: "946 961",
    jabatanUtama: "Bendahara II",
  },
  {
    nama: "Fadlan Mahadi, S.Pt.",
    nbm: "946 948",
    jabatanUtama: "Ketua Majelis Kader dan Pemberdayaan Ranting",
  },
  {
    nama: "Muhamad Wahab",
    nbm: "754 479",
    jabatanUtama: "Ketua Majelis Tabligh dan Pembinaan Masjid/Musholla",
  },
  {
    nama: "Dadang Margono, S.Pd.",
    nbm: "707 876",
    jabatanUtama: "Ketua Majelis Dikdas",
  },
  {
    nama: "H. Arif Wibowo, SKM., M.M.",
    nbm: "685 447",
    jabatanUtama: "Ketua Majelis PKU",
  },
  {
    nama: "Muh. Arif Tri Zunianto, S.H.",
    nbm: "845 495",
    jabatanUtama: "Ketua Majelis Pelayanan Sosial",
  },
  {
    nama: "H. Siswanto, S.Ag.",
    nbm: "1508 862",
    jabatanUtama: "Ketua Majelis Ekonomi dan Pemberdayaan Masyarakat",
  },
  {
    nama: "H. Herman Padiyanto, S.E.",
    nbm: "656 519",
    jabatanUtama: "Ketua Majelis Wakaf dan Kehartabendaan",
  },
];
</script>
