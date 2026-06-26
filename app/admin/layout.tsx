"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAdminEmail } from "@/lib/isAdmin"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("izden_user")
    if (!stored) {
      router.replace("/auth")
      return
    }

    try {
      const user = JSON.parse(stored)
      if (!isAdminEmail(user.email)) {
        router.replace("/")
        return
      }
      setAllowed(true)
      setReady(true)
    } catch {
      localStorage.removeItem("izden_user")
      router.replace("/auth")
    }
  }, [router])

  if (!ready || !allowed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Жүктелуде...</p>
      </div>
    )
  }

  return <>{children}</>
}
