'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { ARTICLE_CATEGORIES } from "@/lib/categories"
import { REQUIRED_ADMIN_APPROVALS } from "@/lib/adminConfig"

export default function SubmitPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [overview, setOverview] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("lessons")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [submitDate, setSubmitDate] = useState("")

  useEffect(() => {
    setSubmitDate(new Date().toLocaleDateString("kk-KZ"))
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("izden_user")
    if (!stored) {
      router.push("/auth")
      return
    }

    setUser(JSON.parse(stored))
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim() || !overview.trim() || !content.trim()) {
      setMessage({ type: "error", text: "Барлық өрістерді толтырыңыз." })
      return
    }

    if (!user) {
      setMessage({ type: "error", text: "Жүйеге кіріңіз." })
      return
    }

    setLoading(true)
    setMessage(null)

    const res = await fetch("/api/articles/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        overview: overview.trim(),
        content: content.trim(),
        category,
        authorId: user.id,
        authorName: user.name,
      }),
    })

    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      setMessage({ type: "error", text: json.error || "Мақала жіберілмеді." })
      return
    }

    setMessage({ type: "success", text: `Мақала тексеруге жіберілді. ${REQUIRED_ADMIN_APPROVALS} әкімші мақұлдауы қажет.` })
    setTitle("")
    setOverview("")
    setContent("")
    setCategory("lessons")
    setTimeout(() => router.push("/profile"), 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-8 py-6">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Мақала жіберу</h1>
            <p className="text-slate-300 mt-2">Автор туралы ақпарат жүйеге автоматты түрде қосылады.</p>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Автор:</p>
                <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Жіберу күні:</p>
                <p className="text-lg font-semibold text-slate-900">{submitDate}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Мақала жариялау талаптары
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Мақала жіберер алдында төмендегі талаптармен міндетті түрде танысыңыз.
              </p>
              <div className="rounded-xl overflow-hidden border border-slate-300">
                <iframe
                  src="/zharyalau-talaptary.pdf"
                  className="w-full h-[500px]"
                  title="Мақала жариялау талаптары"
                />
              </div>
              
                <a href="/zharyalau-talaptary.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium mt-3">
                PDF-ті жаңа терезеде ашу &rarr;
              </a>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Тақырып</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
                  placeholder="Мақаланың тақырыбын жазыңыз"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Қысқаша кіріспе</label>
                <textarea
                  value={overview}
                  onChange={e => setOverview(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
                  placeholder="Мақаланың қысқаша мазмұнын жазыңыз"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Толық мәтін</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={12}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
                  placeholder="Толық мақаланы осы жерде жазыңыз"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Санат</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-amber-500 outline-none"
                >
                  {Object.entries(ARTICLE_CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {message && (
                <div className={`rounded-2xl px-4 py-3 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                  {message.text}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-3 rounded-2xl font-semibold transition"
                >
                  {loading ? "Жіберілуде..." : "Жіберу"}
                </button>
                <p className="text-sm text-slate-500">Мақала {REQUIRED_ADMIN_APPROVALS} әкімші тарапынан мақұлдануы тиіс.</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}