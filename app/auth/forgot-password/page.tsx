"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email.trim()) {
      setError("Email енгізіңіз.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Сұрау жіберілмеді.")
        return
      }
      setMessage(json.message)
      setEmail("")
    } catch {
      setError("Желі қатесі. Қайта көріңіз.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-8 py-6">
            <h1 className="font-heading text-2xl font-bold text-white">Құпиясөзді ұмыттыңыз ба?</h1>
            <p className="text-slate-300 mt-2 text-sm">
              Email енгізіңіз — қалпына келтіру сілтемесін жібереміз
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 mb-6">
                {error}
              </div>
            )}

            {message ? (
              <div className="space-y-6">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
                <p className="text-sm text-slate-600">
                  Email-дегі сілтемені ашып, жаңа құпиясөз орнатыңыз. Сілтеме 1 сағатқа жарамды.
                </p>
                <Link
                  href="/auth"
                  className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-slate-900 py-3 rounded-2xl font-semibold transition"
                >
                  Кіру бетіне оралу
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 py-3 rounded-2xl font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Жіберілуде..." : "Сілтеме жіберу"}
                </button>
              </form>
            )}

            <p className="text-center text-sm text-slate-500 mt-6">
              <Link href="/auth" className="text-amber-600 hover:text-amber-700">← Кіру бетіне оралу</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
