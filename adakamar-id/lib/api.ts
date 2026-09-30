/**
 * adakamar.id API Client
 * Connects frontend (Next.js) directly to the NestJS + MySQL Backend API (port 4000)
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Helper to get stored auth token in browser
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adakamar_token');
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adakamar_token', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adakamar_token');
    localStorage.removeItem('adakamar_user');
  }
}

// Ensure a valid JWT token is present for authenticated requests
export async function ensureAuthToken(role: 'ADMIN' | 'PENULIS' = 'ADMIN'): Promise<string> {
  if (typeof window === 'undefined') return '';
  const existing = getAuthToken();
  if (existing) return existing;

  const credentials =
    role === 'PENULIS'
      ? { email: 'penulis@adakamar.id', password: 'penulis123' }
      : { email: 'admin@adakamar.id', password: 'admin123' };

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.accessToken) {
        setAuthToken(data.accessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('adakamar_user', JSON.stringify(data.user));
        }
        return data.accessToken;
      }
    }
  } catch (err) {
    console.warn('Auto-login background warning:', err);
  }
  return '';
}

// Fetch wrapper with automatic Authorization header injection and auto-auth retry
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  requiredRole: 'ADMIN' | 'PENULIS' = 'ADMIN',
): Promise<T> {
  let token = getAuthToken();
  const method = (options.method || 'GET').toUpperCase();

  // Auto-acquire token for mutations or protected endpoints if missing
  if (!token && (method !== 'GET' || endpoint.includes('/my') || endpoint.includes('/admin'))) {
    token = await ensureAuthToken(requiredRole);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      ...options,
      headers,
    });
  } catch (fetchErr) {
    throw new Error(`Tidak dapat terhubung ke Backend API (${API_BASE_URL}). Pastikan server backend aktif.`);
  }

  // If unauthorized, attempt one auto-refresh login and retry
  if (res.status === 401 && typeof window !== 'undefined') {
    removeAuthToken();
    const refreshedToken = await ensureAuthToken(requiredRole);
    if (refreshedToken) {
      headers['Authorization'] = `Bearer ${refreshedToken}`;
      res = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
        ...options,
        headers,
      });
    }
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.message || res.statusText || 'Terjadi kesalahan sistem';
    throw new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
  }

  return data;
}

// ==================== AUTH API ====================
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiFetch<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adakamar_user', JSON.stringify(res.user));
    }
    return res;
  },

  logout: () => {
    removeAuthToken();
  },

  getProfile: async () => {
    return apiFetch('/auth/profile', {}, 'PENULIS');
  },

  updateProfile: async (data: {
    name?: string;
    phone?: string;
    bio?: string;
    avatarUrl?: string;
    oldPassword?: string;
    newPassword?: string;
  }) => {
    const res = await apiFetch('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, 'PENULIS');
    if (typeof window !== 'undefined' && res) {
      const stored = localStorage.getItem('adakamar_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          localStorage.setItem('adakamar_user', JSON.stringify({ ...parsed, ...res }));
        } catch {}
      }
    }
    return res;
  },
};

// ==================== PROPERTIES API (PENGINAPAN / HOMESTAY) ====================
export const propertiesApi = {
  list: async (params?: {
    search?: string;
    location?: string;
    locationId?: string;
    category?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    capacity?: number;
    bedroomCount?: number;
    facilityId?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return apiFetch<{ data: any[]; meta: any }>(`/properties${qs ? `?${qs}` : ''}`);
  },

  listAdminAll: async (params?: { search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return apiFetch<{ data: any[]; meta: any }>(`/properties/admin/all${qs ? `?${qs}` : ''}`, {}, 'ADMIN');
  },

  getById: async (id: string) => {
    return apiFetch(`/properties/admin/detail/${id}`, {}, 'ADMIN');
  },

  getBySlug: async (slug: string) => {
    return apiFetch(`/properties/${slug}`);
  },

  create: async (data: {
    name: string;
    description: string;
    rules?: string;
    price: number;
    originalPrice?: number;
    address: string;
    locationId?: string;
    categoryId?: string;
    capacity?: number;
    bedroomCount?: number;
    bathroomCount?: number;
    whatsappNumber: string;
    status?: 'ACTIVE' | 'INACTIVE';
    isFeatured?: boolean;
    isPopular?: boolean;
    facilityIds?: string[];
    imageUrls?: string[];
  }) => {
    return apiFetch('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },

  update: async (id: string, data: Partial<any>) => {
    return apiFetch(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },

  remove: async (id: string) => {
    return apiFetch(`/properties/${id}`, {
      method: 'DELETE',
    }, 'ADMIN');
  },

  getWhatsAppBookingUrl: async (
    slug: string,
    bookingData: {
      guestName: string;
      checkInDate?: string;
      checkOutDate?: string;
      guestCount?: number;
      specialNotes?: string;
    },
  ) => {
    return apiFetch<{ whatsappUrl: string; propertyName: string; message: string }>(
      `/properties/${slug}/whatsapp-url`,
      {
        method: 'POST',
        body: JSON.stringify(bookingData),
      },
    );
  },
};

// ==================== REVIEWS API (ULASAN & PENILAIAN TAMU) ====================
export const reviewsApi = {
  getByProperty: async (idOrSlug: string) => {
    return apiFetch<any[]>(`/properties/${idOrSlug}/reviews`);
  },

  create: async (
    idOrSlug: string,
    data: { guestName: string; rating: number; comment: string },
  ) => {
    return apiFetch<{ review: any; newRating: number; reviewCount: number }>(
      `/properties/${idOrSlug}/reviews`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  },
};

// ==================== FACILITIES API (FASILITAS) ====================
export const facilitiesApi = {
  list: async () => {
    return apiFetch<any[]>('/facilities');
  },

  create: async (data: {
    name: string;
    category?: string;
    icon?: string;
    description?: string;
  }) => {
    return apiFetch('/facilities', {
      method: 'POST',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },

  update: async (id: string, data: Partial<any>) => {
    return apiFetch(`/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },

  remove: async (id: string) => {
    return apiFetch(`/facilities/${id}`, {
      method: 'DELETE',
    }, 'ADMIN');
  },
};

// ==================== LOCATIONS API (AREA LOKASI) ====================
export const locationsApi = {
  list: async () => {
    return apiFetch<any[]>('/locations');
  },

  getBySlug: async (slug: string) => {
    return apiFetch(`/locations/${slug}`);
  },

  create: async (data: {
    name: string;
    district?: string;
    description?: string;
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    return apiFetch('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },

  update: async (id: string, data: Partial<any>) => {
    return apiFetch(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },

  remove: async (id: string) => {
    return apiFetch(`/locations/${id}`, {
      method: 'DELETE',
    }, 'ADMIN');
  },
};

// ==================== CATEGORIES API (KATEGORI) ====================
export const categoriesApi = {
  list: async () => {
    return apiFetch<any[]>('/categories');
  },

  getBySlug: async (slug: string) => {
    return apiFetch(`/categories/${slug}`);
  },

  create: async (data: {
    name: string;
    icon?: string;
    description?: string;
  }) => {
    return apiFetch('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },

  update: async (id: string, data: Partial<any>) => {
    return apiFetch(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },

  remove: async (id: string) => {
    return apiFetch(`/categories/${id}`, {
      method: 'DELETE',
    }, 'ADMIN');
  },
};

// ==================== ARTICLES API (ROLE PENULIS & ADMIN) ====================
export const articlesApi = {
  // General admin list
  list: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    return articlesApi.findAllForAdmin(params);
  },

  // Public list (PUBLISHED only)
  listPublic: async (params?: { category?: string; tag?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return apiFetch<{ data: any[]; meta: any }>(`/articles${qs ? `?${qs}` : ''}`);
  },

  getBySlug: async (slug: string) => {
    return apiFetch(`/articles/${slug}`);
  },

  // Author: Get my articles
  getMyArticles: async (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return apiFetch<any[]>(`/articles/my${qs}`, {}, 'PENULIS');
  },

  // Admin: Get All Articles with Stats
  findAllForAdmin: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return apiFetch<{ data: any[]; meta: any; stats: any }>(`/articles/admin/all${qs ? `?${qs}` : ''}`, {}, 'ADMIN');
  },

  // Author: Create new article
  create: async (data: {
    title: string;
    content: string;
    excerpt?: string;
    thumbnailUrl: string;
    categoryId?: string;
    tagIds?: string[];
    readingTime?: string;
    status?: string;
    seoTitle?: string;
    metaDescription?: string;
  }, role: 'ADMIN' | 'PENULIS' = 'PENULIS') => {
    return apiFetch('/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    }, role);
  },

  // Author: Update existing article
  update: async (
    id: string,
    data: Partial<{
      title: string;
      content: string;
      excerpt: string;
      thumbnailUrl: string;
      categoryId: string;
      tagIds: string[];
      readingTime: string;
      status: string;
      seoTitle: string;
      metaDescription: string;
    }>,
    role: 'ADMIN' | 'PENULIS' = 'PENULIS',
  ) => {
    return apiFetch(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, role);
  },

  // Author: Submit draft for editor review
  submitForReview: async (id: string) => {
    return apiFetch(`/articles/${id}/submit-review`, {
      method: 'PATCH',
    }, 'PENULIS');
  },

  // Admin: Review article (Approve -> PUBLISHED, Reject -> REVISION_REQUIRED)
  reviewArticle: async (
    id: string,
    status: 'PUBLISHED' | 'REVISION_REQUIRED' | 'DRAFT',
    revisionNotes?: string,
  ) => {
    const action = status === 'PUBLISHED' ? 'APPROVE' : 'REQUEST_REVISION';
    return apiFetch(`/articles/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action, status, revisionNotes }),
    }, 'ADMIN');
  },

  // Delete Article
  remove: async (id: string, role: 'ADMIN' | 'PENULIS' = 'ADMIN') => {
    return apiFetch(`/articles/${id}`, {
      method: 'DELETE',
    }, role);
  },

  // Admin: Set related properties for an article (PRD Seksi 28)
  setRelatedProperties: async (id: string, propertyIds: string[]) => {
    return apiFetch(`/articles/${id}/properties`, {
      method: 'PUT',
      body: JSON.stringify({ propertyIds }),
    }, 'ADMIN');
  },
};

// ==================== ARTICLE CATEGORIES API ====================
export const articleCategoriesApi = {
  list: async () => {
    return apiFetch<any[]>('/article-categories');
  },
  getBySlug: async (slug: string) => {
    return apiFetch(`/article-categories/${slug}`);
  },
  create: async (data: {
    name: string;
    icon?: string;
    colorAccent?: string;
    description?: string;
    showInNav?: boolean;
    showInFeatured?: boolean;
  }) => {
    return apiFetch('/article-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },
  update: async (id: string, data: Partial<any>) => {
    return apiFetch(`/article-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },
  remove: async (id: string) => {
    return apiFetch(`/article-categories/${id}`, {
      method: 'DELETE',
    }, 'ADMIN');
  },
};

// ==================== ARTICLE TAGS API ====================
export const articleTagsApi = {
  list: async () => {
    return apiFetch<any[]>('/article-tags');
  },
  getBySlug: async (slug: string) => {
    return apiFetch(`/article-tags/${slug}`);
  },
  create: async (data: {
    name: string;
    parentCategory?: string;
    colorAccent?: string;
    isTrending?: boolean;
  }, role: 'ADMIN' | 'PENULIS' = 'PENULIS') => {
    return apiFetch('/article-tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }, role);
  },
  update: async (id: string, data: Partial<any>) => {
    return apiFetch(`/article-tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },
  remove: async (id: string) => {
    return apiFetch(`/article-tags/${id}`, {
      method: 'DELETE',
    }, 'ADMIN');
  },
};

// ==================== INQUIRIES API ====================
export const inquiriesApi = {
  create: async (data: {
    propertyId: string;
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: number;
    notes?: string;
  }) => {
    return apiFetch<{ inquiry: any; whatsappUrl: string }>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  list: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return apiFetch<{ data: any[]; meta: any }>(`/inquiries${qs ? `?${qs}` : ''}`, {}, 'ADMIN');
  },

  updateStatus: async (id: string, status: string) => {
    return apiFetch(`/inquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, 'ADMIN');
  },

  remove: async (id: string) => {
    return apiFetch(`/inquiries/${id}`, {
      method: 'DELETE',
    }, 'ADMIN');
  },
};

// ==================== PROMO API ====================
export const promosApi = {
  listActive: async () => {
    return apiFetch<any[]>('/promos');
  },
  listAdminAll: async () => {
    return apiFetch<any[]>('/promos/admin/all', {}, 'ADMIN');
  },
  create: async (data: any) => {
    return apiFetch('/promos', {
      method: 'POST',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },
  update: async (id: string, data: any) => {
    return apiFetch(`/promos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },
  remove: async (id: string) => {
    return apiFetch(`/promos/${id}`, {
      method: 'DELETE',
    }, 'ADMIN');
  },
  validate: async (code: string, subtotal?: number) => {
    return apiFetch<{ valid: boolean; promo: any; calculatedDiscount: number }>('/promos/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  },
  // Increment usedCount saat kupon berhasil diterapkan tamu (PATCH /promos/use/:code)
  usePromo: async (code: string) => {
    return apiFetch(`/promos/use/${encodeURIComponent(code.toUpperCase())}`, {
      method: 'PATCH',
    });
  },
  // PRD Seksi 13: Set penginapan terkait pada promo
  setPromoProperties: async (promoId: string, propertyIds: string[]) => {
    return apiFetch(`/promos/${promoId}/properties`, {
      method: 'PUT',
      body: JSON.stringify({ propertyIds }),
    }, 'ADMIN');
  },
};


// ==================== USERS API ====================
export const usersApi = {
  findAll: async (role?: string) => {
    const qs = role ? `?role=${role}` : '';
    return apiFetch<any[]>(`/users${qs}`, {}, 'ADMIN');
  },
  create: async (data: { name: string; email: string; password?: string; role?: string; bio?: string; phone?: string }) => {
    return apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },
  createWriter: async (data: { name: string; email: string; password?: string; bio?: string; phone?: string }) => {
    return apiFetch('/users/writers', {
      method: 'POST',
      body: JSON.stringify(data),
    }, 'ADMIN');
  },
  toggleActive: async (id: string) => {
    return apiFetch(`/users/${id}/toggle-active`, {
      method: 'PATCH',
    }, 'ADMIN');
  },
  remove: async (id: string) => {
    return apiFetch(`/users/${id}`, {
      method: 'DELETE',
    }, 'ADMIN');
  },
};

// ==================== SETTINGS API ====================
export const settingsApi = {
  getAll: async () => {
    return apiFetch<Record<string, string>>('/settings');
  },
  updateMultiple: async (settings: Record<string, string>) => {
    return apiFetch<Record<string, string>>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, 'ADMIN');
  },
};
