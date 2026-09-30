"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

export interface NavBarProps {
  items: NavItem[]
  className?: string
  defaultActive?: string
}

export function AnimeNavBar({ items, className, defaultActive = "Jelajah" }: NavBarProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>(defaultActive)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync active tab with current pathname
  useEffect(() => {
    if (!pathname) return
    const matchedItem = items.find((item) => {
      if (item.name === "Kategori" && pathname.startsWith("/kategori")) return true
      if (item.name === "Jelajah" && (pathname === "/" || pathname.startsWith("/homestay"))) return true
      if (item.url === "/" && pathname === "/") return true
      if (item.url !== "/" && pathname.startsWith(item.url)) return true
      return false
    })
    if (matchedItem) {
      setActiveTab(matchedItem.name)
    }
  }, [pathname, items])

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
    <div className={cn("fixed top-7 sm:top-8 left-0 right-0 z-[9999] pointer-events-none px-4", className)}>
      <div className="flex justify-center">
        <motion.div 
          className="flex items-center gap-1 sm:gap-2 bg-zinc-950/85 border border-white/15 backdrop-blur-xl py-1.5 px-2 rounded-full shadow-2xl relative pointer-events-auto max-w-fit"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name
            const isHovered = hoveredTab === item.name

            return (
              <Link
                key={item.name}
                href={item.url}
                onClick={(e) => {
                  setActiveTab(item.name)
                  if (item.url === "#" || item.url === pathname) {
                    e.preventDefault()
                  }
                }}
                onMouseEnter={() => setHoveredTab(item.name)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{ color: "#ffffff" }}
                className={cn(
                  "relative cursor-pointer text-xs sm:text-sm font-semibold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 flex items-center gap-1.5",
                  "text-white hover:text-white",
                  isActive ? "text-white" : "text-white/85 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full -z-10 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0.3, 0.5, 0.3],
                      scale: [1, 1.03, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="absolute inset-0 bg-[#9f3c16]/35 rounded-full blur-md" />
                    <div className="absolute inset-[-4px] bg-[#9f3c16]/25 rounded-full blur-xl" />
                    <div className="absolute inset-[-8px] bg-[#9f3c16]/15 rounded-full blur-2xl" />
                    <div className="absolute inset-[-12px] bg-[#9f3c16]/10 rounded-full blur-3xl" />
                    
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-[#bf542c]/30 to-transparent"
                      style={{
                        animation: "shine 3s ease-in-out infinite"
                      }}
                    />
                  </motion.div>
                )}

                <Icon 
                  className={cn(
                    "w-4 h-4 sm:w-3.5 sm:h-3.5 transition-colors", 
                    isActive ? "text-white" : "text-white/85"
                  )} 
                  style={{ color: "#ffffff" }}
                />

                <motion.span
                  className="hidden sm:inline relative z-10 text-white font-medium"
                  style={{ color: "#ffffff" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.span>
          
                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-white/10 rounded-full -z-10"
                    />
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div
                    layoutId="anime-mascot"
                    className="absolute -top-9 sm:-top-10 left-1/2 -translate-x-1/2 pointer-events-none"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12">
                      <motion.div 
                        className="absolute w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full left-1/2 -translate-x-1/2 shadow-md border border-zinc-200/40"
                        animate={
                          hoveredTab ? {
                            scale: [1, 1.1, 1],
                            rotate: [0, -5, 5, 0],
                            transition: {
                              duration: 0.5,
                              ease: "easeInOut"
                            }
                          } : {
                            y: [0, -3, 0],
                            transition: {
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }
                          }
                        }
                      >
                        {/* Eyes */}
                        <motion.div 
                          className="absolute w-2 h-2 bg-zinc-900 rounded-full"
                          animate={
                            hoveredTab ? {
                              scaleY: [1, 0.2, 1],
                              transition: {
                                duration: 0.2,
                                times: [0, 0.5, 1]
                              }
                            } : {}
                          }
                          style={{ left: '25%', top: '40%' }}
                        />
                        <motion.div 
                          className="absolute w-2 h-2 bg-zinc-900 rounded-full"
                          animate={
                            hoveredTab ? {
                              scaleY: [1, 0.2, 1],
                              transition: {
                                duration: 0.2,
                                times: [0, 0.5, 1]
                              }
                            } : {}
                          }
                          style={{ right: '25%', top: '40%' }}
                        />
                        {/* Cheeks */}
                        <motion.div 
                          className="absolute w-2 h-1.5 bg-rose-300 rounded-full"
                          animate={{
                            opacity: hoveredTab ? 0.9 : 0.6
                          }}
                          style={{ left: '15%', top: '55%' }}
                        />
                        <motion.div 
                          className="absolute w-2 h-1.5 bg-rose-300 rounded-full"
                          animate={{
                            opacity: hoveredTab ? 0.9 : 0.6
                          }}
                          style={{ right: '15%', top: '55%' }}
                        />
                        
                        {/* Mouth */}
                        <motion.div 
                          className="absolute w-3.5 sm:w-4 h-2 border-b-2 border-zinc-900 rounded-full"
                          animate={
                            hoveredTab ? {
                              scaleY: 1.5,
                              y: -1
                            } : {
                              scaleY: 1,
                              y: 0
                            }
                          }
                          style={{ left: '29%', top: '60%' }}
                        />
                        <AnimatePresence>
                          {hoveredTab && (
                            <>
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute -top-1 -right-1 text-xs select-none"
                              >
                                ✨
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ delay: 0.1 }}
                                className="absolute -top-2 left-0 text-xs select-none"
                              >
                                ✨
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Mascot Pointer */}
                      <motion.div
                        className="absolute -bottom-1 left-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 -translate-x-1/2"
                        animate={
                          hoveredTab ? {
                            y: [0, -4, 0],
                            transition: {
                              duration: 0.3,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }
                          } : {
                            y: [0, 2, 0],
                            transition: {
                              duration: 1,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.5
                            }
                          }
                        }
                      >
                        <div className="w-full h-full bg-white rotate-45 transform origin-center shadow-xs" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </Link>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
