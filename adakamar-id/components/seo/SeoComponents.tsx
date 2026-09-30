/**
 * SEO Components — adakamar.id
 * PRD Seksi 20: Structured data (JSON-LD), Breadcrumb, Canonical URL
 */

// ==================== JSON-LD STRUCTURED DATA ====================

interface PropertyJsonLdProps {
  name: string;
  description: string;
  image?: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
  address?: string;
  url: string;
  latitude?: number;
  longitude?: number;
}

/**
 * JSON-LD untuk halaman detail penginapan
 * PRD Seksi 20: Structured data
 */
export function PropertyJsonLd({
  name,
  description,
  image,
  price,
  rating,
  reviewCount,
  address,
  url,
  latitude,
  longitude,
}: PropertyJsonLdProps) {
  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name,
    description,
    url,
  };

  if (image) jsonLd.image = image;
  if (address) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: "Yogyakarta",
      addressRegion: "Daerah Istimewa Yogyakarta",
      addressCountry: "ID",
    };
  }
  if (latitude && longitude) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    };
  }
  if (price) {
    jsonLd.priceRange = `Rp ${price.toLocaleString("id-ID")}`;
  }
  if (rating && reviewCount && reviewCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ArticleJsonLdProps {
  title: string;
  description?: string;
  image?: string;
  authorName: string;
  publishedAt: string;
  updatedAt?: string;
  url: string;
  categoryName?: string;
}

/**
 * JSON-LD untuk halaman detail artikel
 * PRD Seksi 20: Structured data
 */
export function ArticleJsonLd({
  title,
  description,
  image,
  authorName,
  publishedAt,
  updatedAt,
  url,
  categoryName,
}: ArticleJsonLdProps) {
  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    url,
    datePublished: publishedAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "adakamar.id",
      logo: {
        "@type": "ImageObject",
        url: "https://adakamar.id/logo.png",
      },
    },
  };

  if (description) jsonLd.description = description;
  if (image) jsonLd.image = image;
  if (updatedAt) jsonLd.dateModified = updatedAt;
  if (categoryName) jsonLd.articleSection = categoryName;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * JSON-LD Website/Organization untuk homepage
 */
export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "adakamar.id",
    url: "https://adakamar.id",
    description:
      "Platform kurasi homestay autentik Yogyakarta. Temukan kamar nyaman, villa, dan penginapan di Jogja.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://adakamar.id/homestay?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "adakamar.id",
      url: "https://adakamar.id",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ==================== BREADCRUMB ====================

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb Component dengan JSON-LD
 * PRD Seksi 20: Breadcrumb untuk SEO dan navigasi
 */
export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  // JSON-LD BreadcrumbList untuk mesin pencari
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `https://adakamar.id${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1.5 text-xs text-zinc-500 ${className}`}
      >
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <svg
                className="w-3 h-3 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {item.href && index < items.length - 1 ? (
              <a
                href={item.href}
                className="hover:text-[#9f3c16] transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span
                className={
                  index === items.length - 1
                    ? "text-zinc-700 font-medium"
                    : ""
                }
              >
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
