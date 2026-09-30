"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  inline?: boolean
}

export function TubelightNavBar({ items, className, inline }: NavBarProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Determine active tab from current pathname
  const getActiveTab = () => {
    if (!pathname) return items[0].name
    const matched = items.find((item) => {
      if (item.name === "Beranda" && pathname === "/") return true
      if (item.url === "/" && pathname === "/") return true
      if (item.url !== "/" && pathname.startsWith(item.url)) return true
      return false
    })
    return matched?.name ?? items[0].name
  }

  const [activeTab, setActiveTab] = useState(items[0].name)

  useEffect(() => {
    setMounted(true)
    setActiveTab(getActiveTab())
  }, [])

  // Sync active tab when pathname changes (client navigation)
  useEffect(() => {
    if (mounted) {
      setActiveTab(getActiveTab())
    }
  }, [pathname, mounted])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!mounted) return null

  return (
    <div
      className={cn(
        inline
          ? "relative w-fit pointer-events-auto"
          : "fixed bottom-4 sm:top-0 left-1/2 -translate-x-1/2 z-[9990] sm:pt-4 w-fit pointer-events-none",
        className,
      )}
    >
      <motion.div
        className="flex items-center gap-1 bg-zinc-950/85 border border-white/15 backdrop-blur-xl py-1 px-1.5 rounded-full shadow-2xl pointer-events-auto h-11"
        initial={{ y: isMobile && !inline ? 60 : -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      >
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              style={{ color: "#ffffff" }}
              className={cn(
                "relative cursor-pointer text-xs sm:text-sm font-semibold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 flex items-center gap-1.5",
                "text-white/80 hover:text-white",
                isActive && "text-white",
              )}
            >
              {/* Icon (always visible) */}
              <Icon
                className={cn(
                  "w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0 transition-colors",
                  isActive ? "text-white" : "text-white/70"
                )}
                style={{ color: "#ffffff" }}
              />

              {/* Label (hidden on mobile) */}
              <span className="hidden sm:inline text-white font-medium whitespace-nowrap" style={{ color: "#ffffff" }}>
                {item.name}
              </span>

              {/* Active state: tubelight glow + lamp indicator */}
              {isActive && (
                <motion.div
                  layoutId="tubelight-lamp"
                  className="absolute inset-0 w-full rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  {/* Background fill */}
                  <div className="absolute inset-0 bg-[#9f3c16]/30 rounded-full" />

                  {/* Top lamp bar — only show on desktop (top position) */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#9f3c16] rounded-t-full hidden sm:block">
                    {/* Outer glow */}
                    <div className="absolute w-12 h-6 bg-[#9f3c16]/25 rounded-full blur-md -top-2 -left-2" />
                    {/* Mid glow */}
                    <div className="absolute w-8 h-6 bg-[#ffdbcf]/30 rounded-full blur-md -top-1" />
                    {/* Center hotspot */}
                    <div className="absolute w-4 h-4 bg-[#ffdbcf]/40 rounded-full blur-sm top-0 left-2" />
                  </div>

                  {/* Bottom lamp bar — only show on mobile (bottom position) */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#9f3c16] rounded-b-full sm:hidden">
                    <div className="absolute w-12 h-6 bg-[#9f3c16]/25 rounded-full blur-md -bottom-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-[#ffdbcf]/30 rounded-full blur-md -bottom-1" />
                    <div className="absolute w-4 h-4 bg-[#ffdbcf]/40 rounded-full blur-sm bottom-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </motion.div>
    </div>
  )
}
