"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import { supabase } from "@/lib/supabase"
import { REQUIRED_ADMIN_APPROVALS, REVIEW_STATUSES } from "@/lib/adminConfig"
import { ARTICLE_CATEGORIES } from "@/lib/categories"

export default function AdminReviewPage() {
  const [user, setUser] = useState<any>(null)
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("izden_user")
    if (stored) {
      const parsed = JSON.parse(stored)
      setUser(parsed)
      loadPending(parsed.id)
    }
  }, [])

  async function loadPending(adminId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from("article_approvals")
      .select("*, article(*, author(name))")
      .eq("admin_id", adminId)
      .eq("status", REVIEW_STATUSES.CHECKING)
      .order("created_at", { ascending: false })

    setLoading(false)
    if (error) {
      setMessage({ type: "error", text: "Тексеру тізімін жүктеу мүмкін болмады." })
      return
    }

    setPending(data || [])
  }

  async function handleDecision(articleId: string, decision: string) {
    if (!user) return

    setMessage(null)
    const res = await fetch("/api/articles/review", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, adminId: user.id, decision }),
    })

    const json = await res.json()
    if (!res.ok) {
      setMessage({ type: "error", text: json.error || "Қате орын алды." })
      return
    }

    if (decision === REVIEW_STATUSES.APPROVED && json.article?.status === REVIEW_STATUSES.APPROVED) {
      setMessage({ type: "success", text: "Барлық әкімшілер мақұлдады — мақала автоматты түрде жарияланды." })
    } else if (decision === REVIEW_STATUSES.APPROVED) {
      setMessage({ type: "success", text: "Сіздің мақұлдауыңыз сақталды. Басқа әкімшілердің шешімі күтілуде." })
    } else {
      setMessage({ type: "success", text: "Мақала қабылданбады және жарияланбайды." })
    }
    loadPending(user.id)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="flex flex-col gap-6 mb-8">
          <div className="rounded-3xl bg-white border border-slate-200 p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Әкімшілердің мақала тексеруі</h1>
            <p className="text-slate-600">
              Барлық {REQUIRED_ADMIN_APPROVALS} әкімші мақұлдағаннан кейін мақала автоматты түрде жарияланады.
              Бір әкімші қабылдамаса, мақала жарияланбайды.
            </p>
            <p className="text-sm text-slate-500 mt-3">Сіздің email: <span className="font-medium text-slate-700">{user?.email}</span></p>
          </div>

          {message && (
            <div className={`rounded-2xl px-4 py-3 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
              {message.text}
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-center text-slate-500 py-20">Жүктелуде...</p>
        ) : pending.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Кіріс жоқ</h2>
            <p className="text-slate-600">Сізге тексеруге арналған мақала ағымда жоқ.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pending.map(item => {
              const article = item.article || {}
              const articleId = article.id || item.article_id
              return (
                <div key={item.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Тексеру</span>
                      <h2 className="text-2xl font-bold text-slate-900 mt-4">{article.title}</h2>
                      <p className="text-slate-600 mt-3">{article.overview}</p>
                      <div className="mt-4 text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-2xl p-4 border border-slate-200">
                        {article.content}
                      </div>
                      <div className="mt-4 text-sm text-slate-500 space-y-1">
                        <p>Автор: <span className="font-medium text-slate-700">{article.author_name ?? article.author?.name}</span></p>
                        <p>Жіберілген күн: <span className="font-medium text-slate-700">{article.created_at ? new Date(article.created_at).toLocaleDateString("kk-KZ") : "-"}</span></p>
                        <p>Санат: <span className="font-medium text-slate-700">{ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category}</span></p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={() => handleDecision(articleId, REVIEW_STATUSES.APPROVED)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl font-semibold transition"
                      >
                        Қабылдау
                      </button>
                      <button
                        onClick={() => handleDecision(articleId, REVIEW_STATUSES.DECLINED)}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-3 rounded-2xl font-semibold transition"
                      >
                        Қабылдамау
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
