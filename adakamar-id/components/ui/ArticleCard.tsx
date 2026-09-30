import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";

interface ArticleCardProps {
  slug?: string;
  image: string;
  imageAlt: string;
  category: string;
  categoryColor?: string;
  title: string;
  excerpt?: string;
  author: string;
  authorAvatar?: string;
  date: string;
  readTime: string;
  featured?: boolean;
}

export default function ArticleCard({
  slug = "#",
  image,
  imageAlt,
  category,
  categoryColor = "#9f3c16",
  title,
  excerpt,
  author,
  date,
  readTime,
  featured = false,
}: ArticleCardProps) {
  return (
    <Link
      href={`/panduan-jogja/${slug}`}
      className="group flex flex-col no-underline text-inherit"
    >
      <div className="flex flex-col rounded-3xl bg-white border border-zinc-200/70 hover:border-[#9f3c16]/30 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex-1">
        {/* Thumbnail Frame */}
        <div
          className={`relative w-full overflow-hidden bg-zinc-100 ${
            featured ? "aspect-[16/9]" : "aspect-[16/10]"
          }`}
        >
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />

          {/* Subtle bottom scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-md border border-white/20"
              style={{ backgroundColor: categoryColor ? `${categoryColor}E6` : "#9f3c16E6" }}
            >
              {category}
            </span>
          </div>

          {/* Read Time Badge */}
          <div className="absolute bottom-3 right-3 bg-zinc-950/70 backdrop-blur-md border border-white/15 text-white px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 shadow-xs">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>{readTime}</span>
          </div>
        </div>

        {/* Article Details */}
        <div className="p-5 flex flex-col flex-1 justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-zinc-900 group-hover:text-[#9f3c16] transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>

            {excerpt && (
              <p className="text-xs text-zinc-600 line-clamp-2 mt-2 leading-relaxed">
                {excerpt}
              </p>
            )}
          </div>

          {/* Author & Arrow Footer */}
          <div className="pt-3.5 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ffdbcf] to-[#ffd0be] text-[#9f3c16] font-bold text-xs flex items-center justify-center border border-[#ffdbcf]">
                {author.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-900 leading-none">
                  {author}
                </span>
                <span className="text-[10px] text-zinc-400 mt-1">
                  {date}
                </span>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-[#9f3c16] text-zinc-500 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
