"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { supabase } from "@/lib/supabase"

const KAZAKHSTAN_REGIONS = [
  "Алматы облысы",
  "Абай облысы",
  "Ақмола облысы",
  "Ақтөбе облысы",
  "Алматылық аймақ",
  "Атырау облысы",
  "Батыс Қазақстан облысы",
  "Жамбыл облысы",
  "Қарағанды облысы",
  "Қостанай облысы",
  "Қызылорда облысы",
  "Маңғыстау облысы",
  "Павлодар облысы",
  "Солтүстік Қазақстан облысы",
  "Түркістан облысы",
  "Шығыс Қазақстан облысы",
  "Нұр-Сұлтан",
  "Алматы",
  "Шымкент",
]

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [region, setRegion] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError("Email және құпиясөзді енгізіңіз.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Кіру мүмкін болмады.")
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

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setError("Аты мен тегін енгізіңіз.")
      return
    }
    if (!email.trim() || !password) {
      setError("Email және құпиясөзді енгізіңіз.")
      return
    }
    if (password.length < 8) {
      setError("Құпиясөз кемінде 8 таңба болуы керек.")
      return
    }
    if (password !== confirmPassword) {
      setError("Құпиясөздер сәйкес келмейді.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim() || undefined,
          dateOfBirth: dateOfBirth || undefined,
          region: region || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Тіркелу мүмкін болмады.")
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

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-8 py-6">
            <h1 className="font-heading text-2xl font-bold text-white">
              {mode === "login" ? "Жүйеге кіру" : "Тіркелу"}
            </h1>
            <p className="text-slate-300 mt-2 text-sm">
              {mode === "login"
                ? "Izden аккаунтыңызға кіріңіз"
                : "Жаңа аккаунт жасаңыз"}
            </p>
          </div>

          <div className="p-8">
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null) }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-amber-500 text-slate-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Кіру
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(null) }}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                  mode === "signup"
                    ? "bg-amber-500 text-slate-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Тіркелу
              </button>
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 mb-6">
                {error}
              </div>
            )}

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
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
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">Құпиясөз</label>
                    <Link href="/auth/forgot-password" className="text-sm text-amber-600 hover:text-amber-700">
                      Құпиясөзді ұмыттыңыз ба?
                    </Link>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
                    placeholder="Құпиясөз"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 py-3 rounded-2xl font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Күтіңіз..." : "Кіру"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Аты</label>
                    <input
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Тегі</label>
                    <input
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Пайдаланушы аты (міндетті емес)</label>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Туған күні</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Өңір</label>
                    <select
                      value={region}
                      onChange={e => setRegion(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
                    >
                      <option value="">Өңірді таңдаңыз</option>
                      {KAZAKHSTAN_REGIONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Құпиясөз</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Құпиясөзді растау</label>
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
                  {loading ? "Күтіңіз..." : "Тіркелу"}
                </button>
              </form>
            )}

            <p className="text-center text-sm text-slate-500 mt-6">
              <Link href="/" className="text-amber-600 hover:text-amber-700">← Басты бетке оралу</Link>
            </p>
          </div>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400">немесе</span>
            </div>
          <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-2xl font-medium transition mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google арқылы кіру
          </button>
          
          </div>
        </div>
      </div>
    </div>
  )
}
