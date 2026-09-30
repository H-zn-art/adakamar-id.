"use client";

import { useState, useEffect } from "react";
import ArticleCard from "@/components/ui/ArticleCard";
import { articlesApi } from "@/lib/api";

const FALLBACK_ARTICLE_IMAGES = [
  "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
  "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=800",
  "https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?w=800",
];

function mapBackendArticle(a: any, idx = 0) {
  const authorName =
    a.author?.name ||
    (typeof a.author === "string" ? a.author : "Penulis Jogja");
  const dateFormatted = a.publishedAt
    ? new Date(a.publishedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : a.createdAt
    ? new Date(a.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

  return {
    id: a.id || a.slug,
    slug: a.slug,
    image:
      a.thumbnailUrl ||
      a.thumbnail ||
      FALLBACK_ARTICLE_IMAGES[idx % FALLBACK_ARTICLE_IMAGES.length],
    imageAlt: a.title || "Artikel",
    category:
      a.category?.name ||
      (typeof a.category === "string" ? a.category : "Panduan Kawasan"),
    title: a.title,
    excerpt:
      a.excerpt ||
      "Ulasan mendalam dan rekomendasi pengalaman autentik di Yogyakarta...",
    author: authorName,
    date: dateFormatted,
    readTime: a.readingTime || a.readTime || "5 mnt baca",
  };
}

export default function HomeArticlesSection() {
  const [articles, setArticles] = useState<any[]>([]);

  const fetchArticles = async () => {
    try {
      const res = await articlesApi.listPublic({ limit: 3, page: 1 });
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setArticles(res.data.map((a: any, idx: number) => mapBackendArticle(a, idx)));
      } else {
        setArticles([]);
      }
    } catch (err) {
      console.warn("HomeArticlesSection: Failed to fetch published articles:", err);
      setArticles([]);
    }
  };

  useEffect(() => {
    fetchArticles();

    const handleUpdate = () => {
      fetchArticles();
    };

    window.addEventListener("adakamar_articles_updated", handleUpdate);
    return () => window.removeEventListener("adakamar_articles_updated", handleUpdate);
  }, []);

  if (articles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {articles.slice(0, 3).map((a) => (
        <ArticleCard
          key={a.id || a.slug}
          slug={a.slug}
          image={a.image}
          imageAlt={a.imageAlt}
          category={a.category}
          title={a.title}
          excerpt={a.excerpt}
          author={a.author}
          date={a.date}
          readTime={a.readTime}
        />
      ))}
    </div>
  );
}
