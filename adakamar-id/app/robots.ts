/**
 * robots.txt Generator — adakamar.id
 * PRD Seksi 20: SEO
 */
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/penulis/",
          "/masuk",
          "/lupa-kata-sandi",
          "/atur-ulang-kata-sandi",
          "/api/",
        ],
      },
    ],
    sitemap: "https://adakamar.id/sitemap.xml",
    host: "https://adakamar.id",
  };
}
