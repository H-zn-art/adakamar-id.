/**
 * Sitemap Generator — adakamar.id
 * PRD Seksi 20: Sitemap untuk SEO
 * 
 * Next.js App Router sitemap.ts — otomatis generate XML sitemap
 * URL: https://adakamar.id/sitemap.xml
 */
import { MetadataRoute } from "next";

const BASE_URL = "https://adakamar.id";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Fetch semua slug dari backend (untuk halaman dinamis)
async function fetchAllSlugs(endpoint: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      next: { revalidate: 3600 }, // Cache 1 jam
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data) ? data : data?.data || [];
    return items.map((item: any) => item.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Halaman statis
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/homestay`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/panduan-jogja`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/promo`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/kategori`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/area`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/tentang-kami`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/hubungi-kami`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Halaman penginapan dinamis
  const propertySlugs = await fetchAllSlugs("/properties?limit=500&status=ACTIVE");
  const propertyPages: MetadataRoute.Sitemap = propertySlugs.map((slug) => ({
    url: `${BASE_URL}/homestay/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Halaman artikel dinamis
  const articleSlugs = await fetchAllSlugs("/articles?limit=500&status=PUBLISHED");
  const articlePages: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${BASE_URL}/panduan-jogja/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Halaman kategori penginapan dinamis
  const categorySlugs = await fetchAllSlugs("/categories");
  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${BASE_URL}/kategori/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Halaman lokasi/area dinamis
  const locationSlugs = await fetchAllSlugs("/locations");
  const locationPages: MetadataRoute.Sitemap = locationSlugs.map((slug) => ({
    url: `${BASE_URL}/area/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...propertyPages,
    ...articlePages,
    ...categoryPages,
    ...locationPages,
  ];
}
