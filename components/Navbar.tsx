"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { isAdminEmail } from "@/lib/isAdmin"

export default function Navbar() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("izden_user") : null
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        setUser(null)
      }
    }
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-heading font-bold text-lg">І</span>
            </div>
            <span className="text-white font-heading font-bold text-xl">Izden</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/articles" className="text-slate-300 hover:text-amber-400 transition text-sm font-medium">Мақалалар</Link>
            <Link href="/submit" className="text-slate-300 hover:text-amber-400 transition text-sm font-medium">Материал қосу</Link>
            <Link href="/feed" className="text-slate-300 hover:text-amber-400 transition text-sm font-medium">Лента</Link>
            <Link href="/contact" className="text-slate-300 hover:text-amber-400 transition text-sm font-medium">Байланыс</Link>
            {user && isAdminEmail(user.email) && (
              <Link href="/admin/dashboard" className="text-slate-300 hover:text-amber-400 transition text-sm font-medium">Әкімшілер</Link>
            )}
            {user ? (
              <Link href="/profile" className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-1.5 rounded-lg text-sm font-semibold transition">Профиль</Link>
            ) : (
              <Link href="/auth" className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-1.5 rounded-lg text-sm font-semibold transition">Кіру</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}