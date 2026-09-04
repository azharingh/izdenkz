'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function finish() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        setError("Кіру сәтсіз аяқталды.")
        return
      }

      const { email, user_metadata } = session.user

      try {
        const res = await fetch("/api/auth/google-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: user_metadata?.full_name || user_metadata?.name,
            avatarUrl: user_metadata?.avatar_url || user_metadata?.picture,
          }),
        })
        const json = await res.json()

        if (!res.ok) {
          setError(json.error || "Аккаунт синхрондалмады.")
          return
        }

        localStorage.setItem("izden_user", JSON.stringify(json.user))
        await supabase.auth.signOut()
        router.push("/profile")
      } catch {
        setError("Желі қатесі.")
      }
    }
    finish()
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-40 text-center">
        {error ? (
          <div>
            <p className="text-rose-600 mb-4">{error}</p>
            <button onClick={() => router.push("/auth")} className="text-amber-600 hover:text-amber-700 font-medium">
              Қайта көру →
            </button>
          </div>
        ) : (
          <p className="text-slate-500">Кіру аяқталуда...</p>
        )}
      </div>
    </div>
  )
}