"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError("Қалпына келтіру сілтемесі жарамсыз.")
    }
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError("Қалпына келтіру сілтемесі жарамсыз.")
      return
    }
    if (newPassword.length < 8) {
      setError("Құпиясөз кемінде 8 таңба болуы керек.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Құпиясөздер сәйкес келмейді.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Құпиясөз өзгертілмеді.")
        return
      }
      localStorage.setItem("izden_user", JSON.stringify(json.user))
      router.push("/profile")
    } catch {
      setError("Желі қатесі. Қайта көріңіз.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          Қалпына келтіру сілтемесі жарамсыз немесе жоқ.
        </div>
        <Link
          href="/auth/forgot-password"
          className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-slate-900 py-3 rounded-2xl font-semibold transition"
        >
          Жаңа сілтеме сұрау
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Жаңа құпиясөз</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
          minLength={8}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Жаңа құпиясөзді растау</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 py-3 rounded-2xl font-semibold transition disabled:opacity-50"
      >
        {loading ? "Сақталуда..." : "Құпиясөзді сақтау және кіру"}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-8 py-6">
            <h1 className="font-heading text-2xl font-bold text-white">Жаңа құпиясөз</h1>
            <p className="text-slate-300 mt-2 text-sm">
              Жаңа құпиясөзді енгізіп, жүйеге кіріңіз
            </p>
          </div>

          <div className="p-8">
            <Suspense fallback={<p className="text-slate-500 text-sm">Жүктелуде...</p>}>
              <ResetPasswordForm />
            </Suspense>

            <p className="text-center text-sm text-slate-500 mt-6">
              <Link href="/auth" className="text-amber-600 hover:text-amber-700">← Кіру бетіне оралу</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
