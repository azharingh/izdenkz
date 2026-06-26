"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"

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
        </div>
      </div>
    </div>
  )
}
