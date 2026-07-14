"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { isAdminEmail } from "@/lib/isAdmin"
import Image from "next/image"

const NAV_LINKS = [
  { href: "/articles", label: "Мақалалар" },
  { href: "/submit", label: "Материал қосу" },
  { href: "/feed", label: "Лента" },
  { href: "/contact", label: "Байланыс" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

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

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  const authLink = user
    ? { href: "/profile", label: "Профиль", primary: true }
    : { href: "/auth", label: "Кіру", primary: true }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Izden" width={36} height={36} className="rounded-lg" />
            <span className="text-white font-heading font-bold text-xl">Izden</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-300 hover:text-amber-400 transition text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            {user && isAdminEmail(user.email) && (
              <Link href="/admin/dashboard" className="text-slate-300 hover:text-amber-400 transition text-sm font-medium">
                Әкімшілер
              </Link>
            )}
            <Link
              href={authLink.href}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-1.5 rounded-lg text-sm font-semibold transition"
            >
              {authLink.label}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen(open => !open)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            aria-label={menuOpen ? "Мәзірді жабу" : "Мәзірді ашу"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-16 bg-black/40 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-slate-900 border-b border-slate-700/50 shadow-xl">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition ${
                    pathname === link.href
                      ? "bg-amber-500/15 text-amber-400"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && isAdminEmail(user.email) && (
                <Link
                  href="/admin/dashboard"
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition ${
                    pathname.startsWith("/admin")
                      ? "bg-amber-500/15 text-amber-400"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  Әкімшілер
                </Link>
              )}
              <Link
                href={authLink.href}
                className="block mt-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 text-sm font-semibold text-center transition"
              >
                {authLink.label}
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
