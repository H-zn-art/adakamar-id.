"use client"

import * as React from "react"
import { Compass, Tag, Sparkles, BookOpen, PlusCircle } from "lucide-react"
import { AnimeNavBar } from "@/components/ui/anime-navbar"

export const adakamarNavItems = [
  {
    name: "Jelajah",
    url: "/",
    icon: Compass,
  },
  {
    name: "Kategori",
    url: "/kategori/semua",
    icon: Tag,
  },
  {
    name: "Promo",
    url: "/promo",
    icon: Sparkles,
  },
  {
    name: "Panduan",
    url: "/panduan-jogja",
    icon: BookOpen,
  },
  {
    name: "Tuan Rumah",
    url: "/buka-homestay",
    icon: PlusCircle,
  },
]

export function AnimeNavBarDemo() {
  return <AnimeNavBar items={adakamarNavItems} defaultActive="Jelajah" />
}
