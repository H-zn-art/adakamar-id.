/**
 * adakamar.id Persistent Data Store
 * Provides seamless sync between Next.js frontend, localStorage, and NestJS Backend
 */

export interface HomestayData {
  id: string;
  code: string;
  name: string;
  slug: string;
  area: string;
  type: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  status: 'active' | 'curation' | 'draft' | 'inactive';
  featured: boolean;
  image: string;
  description?: string;
  capacity?: string;
  amenities?: string[];
  address?: string;
  whatsappNumber?: string;
}

export interface ArticleData {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  author: {
    name: string;
    role: string;
    initials: string;
  };
  category: string;
  status: 'published' | 'review' | 'revision' | 'draft';
  revisionNotes?: string;
  date: string;
  readTime: string;
  views: number;
  content?: string;
  excerpt?: string;
}

export interface FacilityData {
  id: string;
  name: string;
  category: string;
  icon: string;
  usageCount: number;
  description: string;
}

export interface PromoData {
  id: string;
  code: string;
  title: string;
  discount: string;
  discountPercent?: number;
  minTransaction?: number;
  expiry: string;
  quotaUsed: number;
  quotaMax: number;
  status: 'active' | 'expiring' | 'expired';
}

// ─── Default Initial Data ───
const DEFAULT_HOMESTAYS: HomestayData[] = [
  {
    id: 'hs-1',
    code: 'AKM-001',
    name: 'Omah Joglo Lawas Prawirotaman',
    slug: 'omah-joglo-lawas-prawirotaman',
    area: 'Kota Jogja • Prawirotaman',
    type: 'Omah Joglo',
    price: 680000,
    originalPrice: 850000,
    rating: 4.96,
    reviews: 142,
    status: 'active',
    featured: true,
    capacity: '4 Tamu · 2 Kamar Tidur · Kolam Privat',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDAMh0y4exc_o-2tbuiwa2lfJ6ZsRigJuQQB0AFIJspX9t1V7DWQKw43hPsEE_i59dcsvSGAEN0PYDBuYu5nQILzGFc4GB5jKKWaNUzBQEfXmk6-24GQjNSnVeRigY6W247oqzEC1ltO_XQ7iRu2rkhcsaNbeAIYJNOcAysw9ZdmEtHoAFtF456cjlGXCFpgY0W_5In1sodWT4k7KvxjOeWmdsN5zQx6a-mntY6vfO46Sw9FkS1vZq8',
    description:
      'Homestay bernuansa joglo antik Jawa klasik dengan kolam renang privat di kawasan hits Prawirotaman. Berjarak hanya 10 menit ke Kraton Jogja.',
    address: 'Jl. Prawirotaman No. 36, Mergangsan, Kota Yogyakarta',
    whatsappNumber: '6281234567890',
  },
  {
    id: 'hs-2',
    code: 'AKM-002',
    name: 'Villa Kayu Manis Kaliurang',
    slug: 'villa-kayu-manis-kaliurang',
    area: 'Sleman • Kaliurang',
    type: 'Villa Private Pool',
    price: 1450000,
    originalPrice: 1800000,
    rating: 4.92,
    reviews: 94,
    status: 'active',
    featured: true,
    capacity: '8 Tamu · 4 Kamar Tidur · Lereng Merapi',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtagAkptz4ipaJX26QDaUeTJykLfglFzD21OnCZ1x1I5naVUvhB8wcxG-5VRTuTBuGe6Gcrg9vGTFF2NZGsi7YFjBNQ8ml7d5-KxBFN2kh6wR0AG1JZ6tnIQxrmfGQa4Nrypccbt2WXDO8wRMNdFGvdv3sMP9KiVBHvj7dCjUNsDL2r11E9CeMz-m77Qu9fK8uV-GHOMmL1jq5fw1l7CkOcW1bgTu1p83zEtFE4XtynrnXr6pFAbkS',
    description:
      'Vila kayu jati berhawa sejuk di lereng Gunung Merapi dengan pemandangan rimbun pepohonan pinus dan kolam renang air jernih.',
    address: 'Jl. Kaliurang KM 19, Pakem, Sleman, D.I. Yogyakarta',
    whatsappNumber: '6281298765432',
  },
  {
    id: 'hs-3',
    code: 'AKM-003',
    name: 'Ndalem Gamelan Heritage Kraton',
    slug: 'ndalem-gamelan-heritage-kraton',
    area: 'Kota Jogja • Kraton',
    type: 'Joglo Autentik Heritage',
    price: 850000,
    originalPrice: 950000,
    rating: 4.89,
    reviews: 67,
    status: 'active',
    featured: true,
    capacity: '6 Tamu · 3 Kamar Tidur · Pendopo Gamelan',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCH0Y4rMhUuB9Jk7JvK1W8GgN7r6fQ9l8m5p3w2t1s4r7e8w9q0=s800',
    description:
      'Penginapan berarsitektur ndalem bangsawan Mataram dengan pendopo gamelan aktif dan sentuhan kehangatan hospitality Jawa otentik.',
    address: 'Ndalem Gamelan, Panembahan, Kraton, Kota Yogyakarta',
    whatsappNumber: '6281345678901',
  },
  {
    id: 'hs-4',
    code: 'AKM-004',
    name: 'Omah Tembi Tradisional Bantul',
    slug: 'omah-tembi-tradisional-bantul',
    area: 'Bantul • Sewon',
    type: 'Limasan Pedesaan',
    price: 550000,
    originalPrice: 650000,
    rating: 4.95,
    reviews: 112,
    status: 'active',
    featured: false,
    capacity: '4 Tamu · 2 Kamar Tidur · Tepi Sawah',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Q5Z2g7V1bK3N4M9xL8c7v6B5n4m3l2k1j0h9g8f7d6s5a4=s800',
    description:
      'Retreat tenang di tepi sawah desa wisata Tembi, menyajikan sarapan pincuk tradisional dan pemandangan matahari terbit yang menyejukkan jiwa.',
    address: 'Desa Wisata Tembi, Sewon, Bantul, D.I. Yogyakarta',
    whatsappNumber: '6281789012345',
  },
];

const DEFAULT_ARTICLES: ArticleData[] = [
  {
    id: 'art-1',
    title: '10 Hidden Gem Homestay Tradisional di Kawasan Desa Wisata Tembi',
    slug: '10-hidden-gem-homestay-tradisional-di-bantul-tembi',
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Q5Z2g7V1bK3N4M9xL8c7v6B5n4m3l2k1j0h9g8f7d6s5a4=s800',
    author: {
      name: 'Sekar Ayu Kinanti',
      role: 'Penulis Editorial',
      initials: 'SK',
    },
    category: 'Panduan & Destinasi',
    status: 'published',
    date: '15 Okt 2025',
    readTime: '7 mnt baca',
    views: 18450,
  },
  {
    id: 'art-2',
    title: 'Menikmati Ketenangan Suasana Pagi di Ndalem Gamelan Kraton',
    slug: 'menikmati-ketenangan-suasana-pagi-ndalem-gamelan-kraton',
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCH0Y4rMhUuB9Jk7JvK1W8GgN7r6fQ9l8m5p3w2t1s4r7e8w9q0=s800',
    author: {
      name: 'Sekar Ayu Kinanti',
      role: 'Penulis Editorial',
      initials: 'SK',
    },
    category: 'Budaya & Tradisi',
    status: 'review',
    date: '14 Mei 2025',
    readTime: '4 mnt baca',
    views: 0,
  },
  {
    id: 'art-3',
    title: 'Eksplorasi Kotagede: Napak Tilas Kerajaan Mataram Islam & Rumah Kalang',
    slug: 'eksplorasi-kotagede-napak-tilas-kerajaan-mataram-islam-rumah-kalang',
    thumbnail:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1m9k2l3j4h5g6f7d8s9a0r1e2w3q4l5k6j7h8g9f0d1s2a3=s800',
    author: {
      name: 'Sekar Ayu Kinanti',
      role: 'Penulis Editorial',
      initials: 'SK',
    },
    category: 'Budaya & Tradisi',
    status: 'revision',
    revisionNotes: 'Tolong tambahkan referensi jam buka makam raja-raja dan perbaiki takarir foto.',
    date: '10 Mei 2025',
    readTime: '6 mnt baca',
    views: 0,
  },
];

// ─── LocalStorage Helpers with Window Checks ───
const STORAGE_KEYS = {
  HOMESTAYS: 'adakamar_homestays',
  ARTICLES: 'adakamar_articles',
  FACILITIES: 'adakamar_facilities',
  PROMOS: 'adakamar_promos',
};

export const store = {
  // ── HOMESTAYS ──
  getHomestays: (): HomestayData[] => {
    if (typeof window === 'undefined') return DEFAULT_HOMESTAYS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HOMESTAYS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.HOMESTAYS, JSON.stringify(DEFAULT_HOMESTAYS));
        return DEFAULT_HOMESTAYS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_HOMESTAYS;
    }
  },

  saveHomestay: (data: Partial<HomestayData>): HomestayData => {
    const list = store.getHomestays();
    const id = data.id || `hs-${Date.now()}`;
    const code = data.code || `AKM-${String(list.length + 1).padStart(3, '0')}`;
    const slug = data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `homestay-${Date.now()}`);

    const newHomestay: HomestayData = {
      id,
      code,
      name: data.name || 'Homestay Jogja Baru',
      slug,
      area: data.area || 'Kota Jogja',
      type: data.type || 'Joglo Tradisional',
      price: Number(data.price) || 500000,
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      rating: data.rating || 5.0,
      reviews: data.reviews || 1,
      status: (data.status as any) || 'active',
      featured: data.featured ?? true,
      image:
        data.image ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDAMh0y4exc_o-2tbuiwa2lfJ6ZsRigJuQQB0AFIJspX9t1V7DWQKw43hPsEE_i59dcsvSGAEN0PYDBuYu5nQILzGFc4GB5jKKWaNUzBQEfXmk6-24GQjNSnVeRigY6W247oqzEC1ltO_XQ7iRu2rkhcsaNbeAIYJNOcAysw9ZdmEtHoAFtF456cjlGXCFpgY0W_5In1sodWT4k7KvxjOeWmdsN5zQx6a-mntY6vfO46Sw9FkS1vZq8',
      description: data.description || '',
      capacity: data.capacity || `${data.capacity || 4} Tamu`,
      amenities: data.amenities || ['Wi-Fi', 'AC', 'Parkir'],
      address: data.address || 'Yogyakarta',
      whatsappNumber: data.whatsappNumber || '6281234567890',
    };

    const existingIndex = list.findIndex((h) => h.id === id || h.slug === slug);
    let updatedList: HomestayData[];
    if (existingIndex >= 0) {
      updatedList = list.map((h, i) => (i === existingIndex ? { ...h, ...newHomestay } : h));
    } else {
      updatedList = [newHomestay, ...list];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.HOMESTAYS, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('adakamar_homestays_updated'));
    }

    // Try background sync with Backend REST API if accessible
    fetch('http://localhost:4000/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newHomestay.name,
        slug: newHomestay.slug,
        price: newHomestay.price,
        originalPrice: newHomestay.originalPrice,
        address: newHomestay.address,
        capacity: 4,
        description: newHomestay.description || newHomestay.name,
        whatsappNumber: newHomestay.whatsappNumber,
        isFeatured: newHomestay.featured,
        imageUrl: newHomestay.image,
      }),
    }).catch(() => {});

    return newHomestay;
  },

  deleteHomestay: (id: string) => {
    const list = store.getHomestays();
    const updated = list.filter((h) => h.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.HOMESTAYS, JSON.stringify(updated));
      window.dispatchEvent(new Event('adakamar_homestays_updated'));
    }
  },

  // ── ARTICLES ──
  getArticles: (): ArticleData[] => {
    if (typeof window === 'undefined') return DEFAULT_ARTICLES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(DEFAULT_ARTICLES));
        return DEFAULT_ARTICLES;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_ARTICLES;
    }
  },

  saveArticle: (data: Partial<ArticleData>): ArticleData => {
    const list = store.getArticles();
    const id = data.id || `art-${Date.now()}`;
    const slug = data.slug || (data.title ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `artikel-${Date.now()}`);

    const newArticle: ArticleData = {
      id,
      title: data.title || 'Naskah Baru Tanpa Judul',
      slug,
      thumbnail:
        data.thumbnail ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Q5Z2g7V1bK3N4M9xL8c7v6B5n4m3l2k1j0h9g8f7d6s5a4=s800',
      author: data.author || {
        name: 'Sekar Ayu Kinanti',
        role: 'Penulis Editorial',
        initials: 'SK',
      },
      category: data.category || 'Budaya & Tradisi',
      status: data.status || 'review',
      revisionNotes: data.revisionNotes,
      date: data.date || 'Hari ini',
      readTime: data.readTime || '5 mnt baca',
      views: data.views || 0,
      content: data.content || '',
      excerpt: data.excerpt || '',
    };

    const existingIndex = list.findIndex((a) => a.id === id || a.slug === slug);
    let updatedList: ArticleData[];
    if (existingIndex >= 0) {
      updatedList = list.map((a, i) => (i === existingIndex ? { ...a, ...newArticle } : a));
    } else {
      updatedList = [newArticle, ...list];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('adakamar_articles_updated'));
    }

    return newArticle;
  },

  deleteArticle: (id: string) => {
    const list = store.getArticles();
    const updated = list.filter((a) => a.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updated));
      window.dispatchEvent(new Event('adakamar_articles_updated'));
    }
  },

  updateArticleStatus: (id: string, status: 'published' | 'review' | 'revision' | 'draft', revisionNotes?: string) => {
    const list = store.getArticles();
    const updated = list.map((a) => (a.id === id ? { ...a, status, revisionNotes: revisionNotes !== undefined ? revisionNotes : a.revisionNotes } : a));
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updated));
      window.dispatchEvent(new Event('adakamar_articles_updated'));
    }
  },

  // ── FACILITIES ──
  getFacilities: (): FacilityData[] => {
    const DEFAULT_FACILITIES: FacilityData[] = [
      { id: '1', name: 'Kolam Renang Privat', category: 'Air & Rekreasi', icon: 'pool', usageCount: 58, description: 'Kolam renang khusus satu unit vila tanpa berbagi dengan tamu lain.' },
      { id: '2', name: 'AC di Setiap Kamar', category: 'Kenyamanan Ruang', icon: 'ac_unit', usageCount: 142, description: 'Pendingin ruangan modern dengan pembersihan filter rutin.' },
      { id: '3', name: 'Wi-Fi Kecepatan Tinggi (50+ Mbps)', category: 'Konektivitas', icon: 'wifi', usageCount: 165, description: 'Koneksi serat optik stabil untuk keperluan workation dan meeting online.' },
      { id: '4', name: 'Pendopo & Bale Santai', category: 'Arsitektur Heritage', icon: 'deck', usageCount: 88, description: 'Ruang terbuka beratap joglo untuk bersantai, ngopi, atau jamuan makan.' },
      { id: '5', name: 'Sarapan Tradisional Pincuk', category: 'Gastronomi', icon: 'restaurant', usageCount: 110, description: 'Sarapan khas desa dimasak warga lokal dengan sajian daun pisang pincuk.' },
      { id: '6', name: 'Area Parkir Mobil Luas', category: 'Aksesibilitas', icon: 'local_parking', usageCount: 130, description: 'Kapasitas muat 3-5 mobil dengan akses jalan lebar.' },
    ];
    if (typeof window === 'undefined') return DEFAULT_FACILITIES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FACILITIES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(DEFAULT_FACILITIES));
        return DEFAULT_FACILITIES;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_FACILITIES;
    }
  },

  saveFacility: (data: Partial<FacilityData>): FacilityData => {
    const list = store.getFacilities();
    const id = data.id || `fac-${Date.now()}`;
    const newFacility: FacilityData = {
      id,
      name: data.name || 'Fasilitas Baru',
      category: data.category || 'Kenyamanan Ruang',
      icon: data.icon || 'check_circle',
      usageCount: data.usageCount ?? 0,
      description: data.description || '',
    };
    const existingIndex = list.findIndex((f) => f.id === id);
    let updatedList: FacilityData[];
    if (existingIndex >= 0) {
      updatedList = list.map((f, i) => (i === existingIndex ? { ...f, ...newFacility } : f));
    } else {
      updatedList = [newFacility, ...list];
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('adakamar_facilities_updated'));
    }
    return newFacility;
  },

  deleteFacility: (id: string) => {
    const list = store.getFacilities();
    const updated = list.filter((f) => f.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(updated));
      window.dispatchEvent(new Event('adakamar_facilities_updated'));
    }
  },

  // ── PROMOS ──
  getPromos: (): any[] => {
    const DEFAULT_PROMOS = [
      { id: '1', code: 'JOGJANYAMAN', title: 'Flash Sale Akhir Pekan Jogja Seru', discountType: 'percentage', discountValue: 35, maxDiscount: 250000, minBooking: 500000, usedCount: 82, totalQuota: 100, validUntil: '31 Okt 2025', status: 'active' },
      { id: '2', code: 'HERITAGE50', title: 'Spesial Homestay Joglo Autentik', discountType: 'fixed', discountValue: 150000, minBooking: 600000, usedCount: 45, totalQuota: 50, validUntil: '15 Nov 2025', status: 'active' },
      { id: '3', code: 'MERAPIDISKON', title: 'Retreat Sejuk Kaliurang & Sleman', discountType: 'percentage', discountValue: 20, maxDiscount: 200000, minBooking: 400000, usedCount: 28, totalQuota: 60, validUntil: '20 Nov 2025', status: 'active' },
      { id: '4', code: 'FAMILYSTAY', title: 'Rombongan & Wisata Keluarga Besar', discountType: 'percentage', discountValue: 15, maxDiscount: 300000, minBooking: 1000000, usedCount: 12, totalQuota: 40, validUntil: '30 Des 2025', status: 'active' },
    ];
    if (typeof window === 'undefined') return DEFAULT_PROMOS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROMOS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(DEFAULT_PROMOS));
        return DEFAULT_PROMOS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PROMOS;
    }
  },

  savePromo: (data: any): any => {
    const list = store.getPromos();
    const id = data.id || `prm-${Date.now()}`;
    const newPromo = {
      ...data,
      id,
      code: (data.code || 'PROMO').toUpperCase(),
      usedCount: data.usedCount ?? 0,
      status: data.status || 'active',
    };
    const existingIndex = list.findIndex((p) => p.id === id);
    let updatedList: any[];
    if (existingIndex >= 0) {
      updatedList = list.map((p, i) => (i === existingIndex ? { ...p, ...newPromo } : p));
    } else {
      updatedList = [newPromo, ...list];
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('adakamar_promos_updated'));
    }
    return newPromo;
  },

  deletePromo: (id: string) => {
    const list = store.getPromos();
    const updated = list.filter((p) => p.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(updated));
      window.dispatchEvent(new Event('adakamar_promos_updated'));
    }
  },
};
