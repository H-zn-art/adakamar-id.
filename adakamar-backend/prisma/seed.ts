import { PrismaClient, UserRole, PropertyStatus, ArticleStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seeding database adakamar_db...');

  // 1. Seed Users (Admin & Penulis)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const penulisPassword = await bcrypt.hash('penulis123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@adakamar.id' },
    update: {},
    create: {
      name: 'Raditya Danu',
      email: 'admin@adakamar.id',
      password: adminPassword,
      role: UserRole.ADMIN,
      bio: 'Super Admin & Lead Editor adakamar.id.',
      phone: '081234567890',
    },
  });

  const penulis = await prisma.user.upsert({
    where: { email: 'penulis@adakamar.id' },
    update: {},
    create: {
      name: 'Sekar Ayu Kinanti',
      email: 'penulis@adakamar.id',
      password: penulisPassword,
      role: UserRole.PENULIS,
      bio: 'Kurator budaya dan penikmat arsitektur Mataram kuno di Yogyakarta.',
      phone: '082345678901',
    },
  });

  console.log('✓ Users created: Admin (admin@adakamar.id) & Penulis (penulis@adakamar.id)');

  // 2. Seed Facilities
  const facilitiesData = [
    { name: 'Kolam Renang Privat', category: 'Air & Rekreasi', icon: 'pool', description: 'Kolam renang khusus satu unit vila tanpa berbagi.' },
    { name: 'AC di Setiap Kamar', category: 'Kenyamanan Ruang', icon: 'ac_unit', description: 'Pendingin ruangan modern dengan pembersihan filter rutin.' },
    { name: 'Wi-Fi Kecepatan Tinggi (50+ Mbps)', category: 'Konektivitas', icon: 'wifi', description: 'Koneksi serat optik stabil untuk keperluan workation.' },
    { name: 'Pendopo & Bale Santai', category: 'Arsitektur Heritage', icon: 'deck', description: 'Ruang terbuka beratap joglo untuk bersantai atau jamuan makan.' },
    { name: 'Sarapan Tradisional Pincuk', category: 'Gastronomi', icon: 'restaurant', description: 'Sarapan khas desa dimasak warga lokal dengan sajian daun pisang.' },
    { name: 'Area Parkir Mobil Luas', category: 'Aksesibilitas', icon: 'local_parking', description: 'Parkiran aman berpagar yang muat minimal 3-5 mobil keluarga.' },
    { name: 'Dapur Lengkap & Alat Masak', category: 'Kenyamanan Ruang', icon: 'kitchen', description: 'Kompor, lemari es, dispenser, dan peralatan makan keluarga.' },
  ];

  const facilities: any[] = [];
  for (const f of facilitiesData) {
    let existing = await prisma.facility.findFirst({ where: { name: f.name } });
    if (!existing) {
      existing = await prisma.facility.create({ data: f });
    }
    facilities.push(existing);
  }
  console.log(`✓ Facilities created/ready: ${facilities.length} items`);

  // 3. Seed Location Areas
  const locationsData = [
    { name: 'Kota Yogyakarta / Kraton', slug: 'kraton-yogyakarta', district: 'Kraton', description: 'Pusat kebudayaan adiluhung, dekat Malioboro, Tamansari, dan alun-alun.' },
    { name: 'Sleman & Kaliurang', slug: 'sleman-kaliurang', district: 'Sleman', description: 'Kawasan sejuk lereng Merapi dengan pemandangan persawahan dan udara segar.' },
    { name: 'Bantul & Desa Wisata Tembi', slug: 'bantul-tembi', district: 'Bantul', description: 'Sentra kerajinan batik, gerabah Kasongan, dan ketenangan pedesaan selatan.' },
    { name: 'Gunungkidul', slug: 'gunungkidul', district: 'Gunungkidul', description: 'Garis pantai eksotis, perbukitan karst, dan suasana liburan alam bebas.' },
    { name: 'Kulon Progo', slug: 'kulon-progo', district: 'Kulon Progo', description: 'Dekat Bandara YIA, perbukitan Menoreh, dan perkebunan teh yang asri.' },
  ];

  const locations: any[] = [];
  for (const l of locationsData) {
    const created = await prisma.locationArea.upsert({
      where: { slug: l.slug },
      update: {},
      create: l,
    });
    locations.push(created);
  }
  console.log(`✓ Locations created: ${locations.length} areas`);

  // 4. Seed Property Categories
  const categoriesData = [
    { name: 'Villa Private Pool', slug: 'villa-private-pool', icon: 'pool', description: 'Vila privat eksklusif dengan kolam renang pribadi untuk keluarga.' },
    { name: 'Joglo Autentik Heritage', slug: 'joglo-autentik', icon: 'cottage', description: 'Rumah kayu joglo kuno bernilai sejarah tinggi dengan ukiran jati klasik.' },
    { name: 'Limasan Pedesaan', slug: 'limasan-pedesaan', icon: 'holiday_village', description: 'Hunian tradisional atap limasan di tengah persawahan dan gemercik sungai.' },
    { name: 'Family Retreat', slug: 'family-retreat', icon: 'family_restroom', description: 'Penginapan berkapasitas besar dengan halaman luas ramah anak dan lansia.' },
  ];

  const categories: any[] = [];
  for (const c of categoriesData) {
    const created = await prisma.propertyCategory.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categories.push(created);
  }
  console.log(`✓ Categories created: ${categories.length} categories`);

  // 5. Seed Properties
  const propertiesData = [
    {
      name: 'Omah Joglo Lawas Prawirotaman',
      slug: 'omah-joglo-lawas-prawirotaman',
      description: 'Homestay bernuansa joglo antik Jawa klasik dengan kolam renang privat di kawasan hits Prawirotaman. Berjarak hanya 10 menit ke Kraton Jogja.',
      price: 680000,
      originalPrice: 850000,
      address: 'Jl. Prawirotaman No. 36, Mergangsan, Kota Yogyakarta',
      locationId: locations[0].id,
      categoryId: categories[1].id,
      capacity: 4,
      bedroomCount: 2,
      bathroomCount: 2,
      whatsappNumber: '6285795445463',
      status: PropertyStatus.ACTIVE,
      isFeatured: true,
      isPopular: true,
      rating: 4.96,
      reviewCount: 128,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAMh0y4exc_o-2tbuiwa2lfJ6ZsRigJuQQB0AFIJspX9t1V7DWQKw43hPsEE_i59dcsvSGAEN0PYDBuYu5nQILzGFc4GB5jKKWaNUzBQEfXmk6-24GQjNSnVeRigY6W247oqzEC1ltO_XQ7iRu2rkhcsaNbeAIYJNOcAysw9ZdmEtHoAFtF456cjlGXCFpgY0W_5In1sodWT4k7KvxjOeWmdsN5zQx6a-mntY6vfO46Sw9FkS1vZq8',
    },
    {
      name: 'Villa Kayu Manis Kaliurang',
      slug: 'villa-kayu-manis-kaliurang',
      description: 'Vila kayu jati berhawa sejuk di lereng Gunung Merapi dengan pemandangan rimbun pepohonan pinus dan kolam renang air jernih.',
      price: 1450000,
      originalPrice: 1800000,
      address: 'Jl. Kaliurang KM 19, Pakem, Sleman, D.I. Yogyakarta',
      locationId: locations[1].id,
      categoryId: categories[0].id,
      capacity: 8,
      bedroomCount: 4,
      bathroomCount: 3,
      whatsappNumber: '6281298765432',
      status: PropertyStatus.ACTIVE,
      isFeatured: true,
      isPopular: true,
      rating: 4.92,
      reviewCount: 94,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtagAkptz4ipaJX26QDaUeTJykLfglFzD21OnCZ1x1I5naVUvhB8wcxG-5VRTuTBuGe6Gcrg9vGTFF2NZGsi7YFjBNQ8ml7d5-KxBFN2kh6wR0AG1JZ6tnIQxrmfGQa4Nrypccbt2WXDO8wRMNdFGvdv3sMP9KiVBHvj7dCjUNsDL2r11E9CeMz-m77Qu9fK8uV-GHOMmL1jq5fw1l7CkOcW1bgTu1p83zEtFE4XtynrnXr6pFAbkS',
    },
    {
      name: 'Ndalem Gamelan Heritage Kraton',
      slug: 'ndalem-gamelan-heritage-kraton',
      description: 'Penginapan berarsitektur ndalem bangsawan Mataram dengan pendopo gamelan aktif dan sentuhan kehangatan hospitality Jawa otentik.',
      price: 850000,
      originalPrice: 950000,
      address: 'Ndalem Gamelan, Panembahan, Kraton, Kota Yogyakarta',
      locationId: locations[0].id,
      categoryId: categories[1].id,
      capacity: 6,
      bedroomCount: 3,
      bathroomCount: 2,
      whatsappNumber: '6281345678901',
      status: PropertyStatus.ACTIVE,
      isFeatured: true,
      isPopular: false,
      rating: 4.89,
      reviewCount: 67,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH0Y4rMhUuB9Jk7JvK1W8GgN7r6fQ9l8m5p3w2t1s4r7e8w9q0=s800',
    },
    {
      name: 'Omah Tembi Tradisional Bantul',
      slug: 'omah-tembi-tradisional-bantul',
      description: 'Retreat tenang di tepi sawah desa wisata Tembi, menyajikan sarapan pincuk tradisional dan pemandangan matahari terbit yang menyejukkan jiwa.',
      price: 550000,
      originalPrice: 650000,
      address: 'Desa Wisata Tembi, Sewon, Bantul, D.I. Yogyakarta',
      locationId: locations[2].id,
      categoryId: categories[2].id,
      capacity: 4,
      bedroomCount: 2,
      bathroomCount: 1,
      whatsappNumber: '6281789012345',
      status: PropertyStatus.ACTIVE,
      isFeatured: false,
      isPopular: true,
      rating: 4.95,
      reviewCount: 112,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Q5Z2g7V1bK3N4M9xL8c7v6B5n4m3l2k1j0h9g8f7d6s5a4=s800',
    },
  ];

  for (const p of propertiesData) {
    const { imageUrl, ...pData } = p;
    const prop = await prisma.property.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...pData,
        images: {
          create: [
            { imageUrl, isCover: true, sortOrder: 0, caption: p.name },
          ],
        },
        facilities: {
          create: facilities.slice(0, 4).map((f) => ({ facilityId: f.id })),
        },
      },
    });
  }
  console.log(`✓ Properties created: ${propertiesData.length} homestays`);

  // 6. Seed Article Categories & Tags
  const artCat1 = await prisma.articleCategory.upsert({
    where: { slug: 'panduan-destinasi' },
    update: {},
    create: {
      name: 'Panduan & Destinasi',
      slug: 'panduan-destinasi',
      icon: 'explore',
      colorAccent: '#9f3c16',
      description: 'Panduan menjelajah sudut tersembunyi, rute desa wisata, dan kawasan otentik di Daerah Istimewa Yogyakarta.',
    },
  });

  const artCat2 = await prisma.articleCategory.upsert({
    where: { slug: 'budaya-tradisi-jawa' },
    update: {},
    create: {
      name: 'Budaya & Tradisi Jawa',
      slug: 'budaya-tradisi-jawa',
      icon: 'temple_buddhist',
      colorAccent: '#8d4b00',
      description: 'Filosofi arsitektur joglo, etiket bertamu khas Mataram, ritual adat, dan seni gamelan kraton.',
    },
  });

  const tag1 = await prisma.articleTag.upsert({
    where: { slug: 'joglo-heritage' },
    update: {},
    create: {
      name: 'Joglo Heritage',
      slug: 'joglo-heritage',
      parentCategory: 'Arsitektur & Budaya Jawa',
      colorAccent: '#9f3c16',
      isTrending: true,
    },
  });

  const tag2 = await prisma.articleTag.upsert({
    where: { slug: 'private-pool-sleman' },
    update: {},
    create: {
      name: 'Private Pool Sleman',
      slug: 'private-pool-sleman',
      parentCategory: 'Rekomendasi & Tipe Penginapan',
      colorAccent: '#15803D',
      isTrending: true,
    },
  });

  // 7. Seed Articles (Sesuai Alur Status PRD)
  await prisma.article.upsert({
    where: { slug: '10-hidden-gem-homestay-tradisional-di-bantul-tembi' },
    update: {},
    create: {
      title: '10 Hidden Gem Homestay Tradisional di Kawasan Desa Wisata Tembi',
      slug: '10-hidden-gem-homestay-tradisional-di-bantul-tembi',
      content: 'Bantul menyimpan ketenangan pedesaan yang sulit ditemukan di hiruk pikuk kota. Kawasan Desa Wisata Tembi menghadirkan pengalaman menginap di omah joglo dan limasan kayu jati kuno...',
      excerpt: 'Menemukan kedamaian menginap di tengah persawahan dan kearifan lokal desa perajin Tembi Bantul.',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Q5Z2g7V1bK3N4M9xL8c7v6B5n4m3l2k1j0h9g8f7d6s5a4=s800',
      status: ArticleStatus.PUBLISHED,
      views: 18450,
      readingTime: '7 mnt baca',
      publishedAt: new Date(),
      authorId: penulis.id,
      categoryId: artCat1.id,
      tags: { create: [{ tagId: tag1.id }] },
    },
  });

  await prisma.article.upsert({
    where: { slug: 'menikmati-ketenangan-suasana-pagi-ndalem-gamelan-kraton' },
    update: {},
    create: {
      title: 'Menikmati Ketenangan Suasana Pagi di Ndalem Gamelan Kraton',
      slug: 'menikmati-ketenangan-suasana-pagi-ndalem-gamelan-kraton',
      content: 'Saat fajar merekah di dalam benteng Kraton Yogyakarta, suasana hening dan aroma wedang uwuh hangat menyambut para tamu yang bermalam di Ndalem Gamelan...',
      excerpt: 'Pengalaman spiritual dan ketenangan batin menginap di kediaman bangsawan keraton bersejarah.',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH0Y4rMhUuB9Jk7JvK1W8GgN7r6fQ9l8m5p3w2t1s4r7e8w9q0=s800',
      status: ArticleStatus.PENDING_REVIEW,
      views: 0,
      readingTime: '4 mnt baca',
      authorId: penulis.id,
      categoryId: artCat2.id,
      tags: { create: [{ tagId: tag1.id }] },
    },
  });

  await prisma.article.upsert({
    where: { slug: 'eksplorasi-kotagede-napak-tilas-kerajaan-mataram-islam' },
    update: {},
    create: {
      title: 'Eksplorasi Kotagede: Napak Tilas Kerajaan Mataram Islam & Rumah Kalang',
      slug: 'eksplorasi-kotagede-napak-tilas-kerajaan-mataram-islam-rumah-kalang',
      content: 'Menelusuri lorong sempit berarsitektur paduan Jawa dan Eropa di Kotagede, bekas ibu kota Kesultanan Mataram...',
      excerpt: 'Jelajah gang sempit bersejarah dan arsitektur Rumah Kalang saudagar perak Kotagede.',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1m9k2l3j4h5g6f7d8s9a0r1e2w3q4l5k6j7h8g9f0d1s2a3=s800',
      status: ArticleStatus.REVISION_REQUIRED,
      revisionNotes: 'Tolong tambahkan referensi jam buka makam raja-raja dan perbaiki takarir foto.',
      views: 0,
      readingTime: '6 mnt baca',
      authorId: penulis.id,
      categoryId: artCat2.id,
      tags: { create: [{ tagId: tag1.id }] },
    },
  });
  console.log('✓ Articles created with various statuses (Published, Pending Review, Revision Required)');

  // 8. Seed Promo
  await prisma.promo.upsert({
    where: { code: 'JOGJANYAMAN' },
    update: {},
    create: {
      code: 'JOGJANYAMAN',
      title: 'Promo Akhir Pekan Jogja Seru — Diskon 20%',
      description: 'Potongan harga spesial untuk pemesanan homestay bernuansa heritage di akhir pekan.',
      discountPercent: 20,
      minTransaction: 500000,
      quota: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      terms: 'Berlaku untuk semua homestay berlabel Javanese Modernism dengan pemesanan minimal 2 malam.',
    },
  });
  console.log('✓ Promo coupon created: JOGJANYAMAN');

  // 9. Seed Site Settings
  await prisma.siteSetting.upsert({
    where: { key: 'site_name' },
    update: {},
    create: { key: 'site_name', value: 'adakamar.id' },
  });
  await prisma.siteSetting.upsert({
    where: { key: 'contact_whatsapp' },
    update: { value: '6285795445463' },
    create: { key: 'contact_whatsapp', value: '6285795445463' },
  });
  await prisma.siteSetting.upsert({
    where: { key: 'maintenance_mode' },
    update: {},
    create: { key: 'maintenance_mode', value: 'false' },
  });
  console.log('✓ Site settings seeded');

  console.log('🎉 Seeding database adakamar_db selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
