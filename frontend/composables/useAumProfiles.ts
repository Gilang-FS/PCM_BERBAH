import { AUM_LIST, normalizeAumName } from './useAum'

// TODO(API): Lengkapi metadata yang masih bernilai "-":
// PCM Berbah (tahun); Pajangan 1 (email); Pajangan 2 (email);
// Noyokerten (tahun, email); Semoya (tahun); Bulu (tahun, alamat, email);
// SMK Berbah (email); Klinik PKU (tahun, alamat, email);
// Lazismu Berbah dan Masjid (semua info).

// Placeholder lokal sementara sampai materi resmi tiap AUM tersedia dari API.
const SCHOOL_HERO = '/images/hero-1.png'
const HEALTH_HERO = '/images/hero-2.png'
const MOSQUE_HERO = '/images/musycab_hero.jpg'

export const AUM_PROFILES = {
  'PCM Berbah': {
    hero: '/images/hero-2.png',
    profile: 'Pimpinan Cabang Muhammadiyah (PCM) Berbah merupakan representasi gerakan dakwah Islam amar ma\'ruf nahi munkar di tingkat Kapanewon (Kecamatan) Berbah yang bergerak langsung di bawah koordinasi Pimpinan Daerah Muhammadiyah (PDM) Sleman. Sebagai pilar persyarikatan, organisasi ini berkomitmen penuh untuk menghidupkan syiar Islam yang murni, inklusif, dan berkemajuan di tengah masyarakat. Melalui pendekatan dakwah kultural yang adaptif, PCM Berbah fokus pada penguatan nilai-nilai keagamaan, pembinaan moral, serta peningkatan kepedulian sosial guna mewujudkan tatanan masyarakat yang religius, mandiri, dan berbudaya luhur. Dengan semangat kolaborasi yang kuat bersama elemen pemerintah dan seluruh warga persyarikatan, PCM Berbah terus bergerak aktif menjadi motor penggerak pembangunan umat demi terwujudnya wilayah Berbah yang berkemajuan.',
    info: [
      { label: 'Nama Resmi', value: 'Pimpinan Cabang Muhammadiyah Berbah' },
      { label: 'Tahun Berdiri', value: '-' },
      { label: 'Alamat', value: 'Jl. Tegal Sari, Krikilan, Tegaltirto, Berbah, Sleman' },
      { label: 'Email', value: 'info@pcmberbah.com' },
    ],
  },
  'SD Muhammadiyah Karangharjo': {
    hero: SCHOOL_HERO,
    profile: 'SD Muhammadiyah Karangharjo adalah sekolah dasar Islam terakreditasi "A" yang berlokasi di Bedilan, Kalitirto, Berbah, Sleman, Yogyakarta. Sekolah ini berkomitmen mencetak generasi unggul, berakhlak mulia, dan berwawasan lingkungan melalui lingkungan belajar yang religius, aman, dan kondusif. Dengan mengusung nilai utama Ceria, Santun, dan Prasojo, sekolah ini tidak hanya mengintegrasikan kurikulum akademik dengan nilai-nilai Al-Islam, tetapi juga aktif mendorong kreativitas siswa lewat program inovatif seperti pemanfaatan limbah menjadi karya bernilai guna. Didukung tenaga pendidik yang kompeten dan tradisi kelulusan 100 persen, SD Muhammadiyah Karangharjo siap menjadi mitra terbaik bagi orang tua dalam mendampingi tumbuh kembang dan prestasi putra-putri mereka.',
    info: [
      { label: 'Nama Resmi', value: 'SD Muhammadiyah Karangharjo' },
      { label: 'Tahun Berdiri', value: '1991' },
      { label: 'Alamat', value: 'Bedilan RT 02 RW 37, Kalitirto, Berbah, Sleman' },
      { label: 'Email', value: 'sdmuhkarangharjo1@gmail.com' },
    ],
  },
  'SD Muhammadiyah Pajangan 1': {
    hero: SCHOOL_HERO,
    profile: 'SD Muhammadiyah Pajangan 1 (Mupasa) adalah sekolah dasar swasta terakreditasi "A" yang berlokasi di Dawukan, Sendangtirto, Berbah, Sleman, Yogyakarta. Berdiri sejak tahun 1991 di bawah naungan Pimpinan Daerah Muhammadiyah Sleman, sekolah ini mengusung semboyan "Mupasa Ceria". Lembaga ini berfokus pada penyediaan pendidikan dasar yang bermutu, mengintegrasikan kurikulum akademik dengan penguatan karakter islami, serta membangun sinergi yang kuat bersama orang tua wali murid untuk mendukung keberhasilan studi seluruh siswa.',
    info: [
      { label: 'Nama Resmi', value: 'SD Muhammadiyah Pajangan 1' },
      { label: 'Tahun Berdiri', value: '1991' },
      { label: 'Alamat', value: 'Dawukan, Sendangtirto, Berbah, Sleman' },
      { label: 'Email', value: '-' },
    ],
  },
  'SD Muhammadiyah Pajangan 2': {
    hero: SCHOOL_HERO,
    profile: 'SD Muhammadiyah Pajangan 2 (Mupada) merupakan sekolah dasar swasta yang berlokasi di Gandu, Sendangtirto, Berbah, Sleman, Yogyakarta. Didirikan sejak tahun 1977, sekolah ini mengusung slogan "Pencetak Generasi Qur\'ani" dengan program unggulan di bidang Tahfidz dan Tilawati. Selain mengintegrasikan kurikulum akademik untuk membentuk siswa yang unggul dalam ilmu dan prestasi, SD Muhammadiyah Pajangan 2 juga fokus pada penguatan nilai karakter religius agar setiap lulusannya tidak hanya cakap dalam ilmu pendidikan, tetapi juga berakhlak mulia dan hafal Al-Qur\'an minimal Juz 30.',
    info: [
      { label: 'Nama Resmi', value: 'SD Muhammadiyah Pajangan 2' },
      { label: 'Tahun Berdiri', value: '1977' },
      { label: 'Alamat', value: 'Gandu, Sendangtirto, Berbah, Sleman' },
      { label: 'Email', value: '-' },
    ],
  },
  'SD Muhammadiyah Noyokerten': {
    hero: SCHOOL_HERO,
    profile: 'SD Muhammadiyah Noyokerten (Monesh) adalah institusi pendidikan dasar swasta yang terletak di Noyokerten, Sendangtirto, Berbah, Sleman, Yogyakarta. Sekolah ini berkomitmen mewujudkan lembaga pendidikan Muhammadiyah yang unggul, islami, mencerdaskan, serta kreatif. Fokus utamanya mencakup penanaman karakter mulia berlandaskan nilai-nilai agama, serta melatih daya pikir kritis peserta didik melalui program pembelajaran inovatif, seperti Kurikulum Merdeka yang dikombinasikan dengan keterampilan praktis lokal. Didukung oleh tenaga pendidik profesional, SD Muhammadiyah Noyokerten berdedikasi tinggi untuk mencetak generasi yang berdaya saing global sekaligus berakhlak karimah.',
    info: [
      { label: 'Nama Resmi', value: 'SD Muhammadiyah Noyokerten' },
      { label: 'Tahun Berdiri', value: '-' },
      { label: 'Alamat', value: 'Noyokerten, Sendangtirto, Berbah, Sleman' },
      { label: 'Email', value: '-' },
    ],
  },
  'SD Muhammadiyah Semoya': {
    hero: SCHOOL_HERO,
    profile: 'SD Muhammadiyah Semoya (Muhaya) merupakan institusi pendidikan dasar swasta terakreditasi "A" yang berlokasi di Semoya, Tegaltirto, Berbah, Sleman, Yogyakarta. Mengusung slogan "Religius, Berprestasi, Berkarakter", sekolah ini menaruh perhatian besar pada pembentukan karakter akhlakul karimah yang diintegrasikan dengan kurikulum akademik melalui program unggulan seperti Wisuda Tahfidz dan Tilawati. Meskipun berada di area perdesaan, SD Muhammadiyah Semoya terus berinovasi dalam membekali siswanya dengan keterampilan masa depan, salah satunya melalui program edukasi teknologi robotika. Didukung oleh lingkungan belajar yang kondusif, kegiatan praktik kemandirian seperti Market Day, serta kepedulian sosial yang tinggi, sekolah ini sukses mencetak berbagai prestasi siswa di tingkat kabupaten sekaligus mempertahankan tradisi mutu lulusan yang unggul.',
    info: [
      { label: 'Nama Resmi', value: 'SD Muhammadiyah Semoya' },
      { label: 'Tahun Berdiri', value: '-' },
      { label: 'Alamat', value: 'Semoya, Tegaltirto, Berbah, Sleman' },
      { label: 'Email', value: 'sd.muhsemoya01@gmail.com' },
    ],
  },
  'SD Muhammadiyah Bulu': {
    hero: SCHOOL_HERO,
    profile: 'SD Muhammadiyah Bulu merupakan layanan pendidikan dasar Muhammadiyah yang mendampingi peserta didik melalui pembelajaran bermutu dan pembentukan karakter islami.',
    info: [
      { label: 'Nama Resmi', value: 'SD Muhammadiyah Bulu' },
      { label: 'Tahun Berdiri', value: '-' },
      { label: 'Alamat', value: '-' },
      { label: 'Email', value: '-' },
    ],
  },
  'SMP Muhammadiyah 1 Berbah': {
    hero: SCHOOL_HERO,
    profile: 'SMP Muhammadiyah 1 Berbah (dikenal sebagai SMP Mukri) merupakan institusi pendidikan menengah pertama swasta terakreditasi "A" yang berlokasi di Krikilan, Tegaltirto, Berbah, Sleman, Yogyakarta. Berdiri sejak tahun 1963, sekolah unggulan ini berkomitmen menyelenggarakan pendidikan Islam yang adaptif terhadap ilmu pengetahuan dan teknologi (IPTEK) dengan tetap menjunjung tinggi nilai budaya dan kelestarian lingkungan. Mengusung jargon "MUKRI" (Mandiri, Unggul, Kreatif, Religius, Integritas), SMP Muhammadiyah 1 Berbah menyeimbangkan pencapaian akademis siswa dengan pembentukan karakter religius yang kokoh melalui pembiasaan salat dhuha, tahfidz, tahsin, serta program ekstrakurikuler inovatif mulai dari seni, olahraga, hingga bidang kepenyiaran (broadcast).',
    info: [
      { label: 'Nama Resmi', value: 'SMP Muhammadiyah 1 Berbah' },
      { label: 'Tahun Berdiri', value: '1963' },
      { label: 'Alamat', value: 'Krikilan, Tegaltirto, Berbah, Sleman' },
      { label: 'Email', value: 'smpmuhberbah@gmail.com' },
    ],
  },
  'SMK Muhammadiyah Berbah': {
    hero: SCHOOL_HERO,
    profile: 'SMK Muhammadiyah Berbah (Skamuba) merupakan institusi pendidikan kejuruan swasta terakreditasi "A" yang berlokasi di Krikilan, Tegaltirto, Berbah, Sleman, Yogyakarta. Berdiri sejak tahun 1969, sekolah ini memiliki komitmen kuat untuk mencetak lulusan dengan jargon khas "Anggun dalam Moral, Unggul dalam Kompetensi". Sebagai lembaga pendidikan berbasis Islam, SMK Muhammadiyah Berbah berfokus pada pembentukan karakter religius sekaligus membekali para siswa dengan kompetensi keahlian yang relevan melalui program studi unggulan seperti Akuntansi dan Keuangan Lembaga, Tata Busana, Teknik dan Bisnis Sepeda Motor (TBSM), serta Desain Komunikasi Visual (DKV). Didukung kegiatan ekstrakurikuler kepanduan Hizbul Wathan dan sarana penunjang yang memadai, sekolah ini siap mempersiapkan generasi muda kreatif yang siap kerja, berwirausaha, atau melanjutkan studi.',
    info: [
      { label: 'Nama Resmi', value: 'SMK Muhammadiyah Berbah' },
      { label: 'Tahun Berdiri', value: '1969' },
      { label: 'Alamat', value: 'Krikilan, Tegaltirto, Berbah, Sleman' },
      { label: 'Email', value: '-' },
    ],
  },
  'Klinik PKU Muhammadiyah Berbah': {
    hero: HEALTH_HERO,
    profile: 'Klinik Pratama PKU Muhammadiyah Berbah merupakan fasilitas pelayanan kesehatan tingkat pertama yang berdedikasi untuk memberikan layanan medis yang bermutu, aman, dan islami bagi masyarakat di wilayah Kapanewon (Kecamatan) Berbah dan sekitarnya. Sebagai bagian dari jaringan fasilitas kesehatan Muhammadiyah, klinik ini berfungsi sebagai garda terdepan dalam menyelenggarakan pelayanan rawat jalan umum, kesehatan gigi, pemeriksaan kebidanan, hingga program promotif dan preventif kesehatan keluarga. Didukung oleh tenaga medis yang kompeten, keramahan layanan, serta pencapaian akreditasi dengan predikat Paripurna, Klinik Pratama PKU Muhammadiyah Berbah terus berkomitmen untuk memberikan penanganan medis yang cepat dan tepercaya demi mewujudkan masyarakat Berbah yang sehat dan sejahtera.',
    info: [
      { label: 'Nama Resmi', value: 'Klinik PKU Muhammadiyah Berbah' },
      { label: 'Tahun Berdiri', value: '-' },
      { label: 'Alamat', value: '-' },
      { label: 'Email', value: '-' },
    ],
  },
  'Lazismu Berbah': {
    hero: '/images/hero-2.png',
    profile: 'Lazismu Berbah merupakan lembaga amil zakat, infak, dan sedekah Muhammadiyah yang melayani penghimpunan serta penyaluran dana umat untuk program dakwah, pendidikan, kesehatan, sosial, dan pemberdayaan masyarakat di wilayah Berbah.',
    info: [
      { label: 'Nama Resmi', value: '-' },
      { label: 'Tahun Berdiri', value: '-' },
      { label: 'Alamat', value: '-' },
      { label: 'Email', value: '-' },
    ],
  },
  'Masjid': {
    hero: MOSQUE_HERO,
    profile: 'Unit Masjid menjadi pusat ibadah, pembinaan jamaah, pendidikan keagamaan, dan kegiatan sosial yang memperkuat kehidupan umat di wilayah Berbah.',
    info: [
      { label: 'Nama Resmi', value: '-' },
      { label: 'Tahun Berdiri', value: '-' },
      { label: 'Alamat', value: '-' },
      { label: 'Email', value: '-' },
    ],
  },
}

const FALLBACK_PROFILE = {
  hero: '/images/hero-2.png',
  profile: 'Unit ini merupakan bagian dari gerakan dan pelayanan Muhammadiyah di wilayah Berbah. Informasi profil dan aset wakaf ditampilkan sebagai bentuk keterbukaan kepada masyarakat.',
  info: [
    { label: 'Nama Resmi', value: '-' },
    { label: 'Tahun Berdiri', value: '-' },
    { label: 'Alamat', value: '-' },
    { label: 'Email', value: '-' },
  ],
}

export const useAumProfiles = () => {
  const getAumProfile = (aum: string) => AUM_PROFILES[normalizeAumName(aum) as keyof typeof AUM_PROFILES] || FALLBACK_PROFILE

  return {
    aumProfiles: AUM_LIST.map(aum => ({ aum, ...getAumProfile(aum) })),
    getAumProfile,
  }
}
