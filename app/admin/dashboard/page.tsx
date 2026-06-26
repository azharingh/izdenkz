"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { supabase } from "@/lib/supabase"
import { REQUIRED_ADMIN_APPROVALS, REVIEW_STATUSES } from "@/lib/adminConfig"
import { ARTICLE_CATEGORIES } from "@/lib/categories"

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [totalAssigned, setTotalAssigned] = useState(0)
  const [pendingItems, setPendingItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("izden_user")
    if (stored) {
      const parsed = JSON.parse(stored)
      setUser(parsed)
      loadStats(parsed.id)
    }
  }, [])

  async function loadStats(adminId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from("article_approvals")
      .select("id,status,article_id,article(id,title,overview,created_at,category,author(name))")
      .eq("admin_id", adminId)
      .order("created_at", { ascending: false })

    setLoading(false)
    if (error || !data) {
      setPendingCount(0)
      setPendingItems([])
      setTotalAssigned(0)
      return
    }

    setTotalAssigned(data.length)
    const pending = data.filter(item => item.status === REVIEW_STATUSES.CHECKING)
    setPendingCount(pending.length)
    setPendingItems(pending)
  }

  async function handleDecision(articleId: string, decision: string) {
    if (!user) return

    setActionMessage(null)
    const res = await fetch("/api/articles/review", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, adminId: user.id, decision }),
    })

    const json = await res.json()
    if (!res.ok) {
      setActionMessage(json.error || "Шешім беру мүмкін болмады.")
      return
    }

    if (decision === REVIEW_STATUSES.APPROVED && json.article?.status === REVIEW_STATUSES.APPROVED) {
      setActionMessage("Барлық әкімшілер мақұлдады — мақала жарияланды.")
    } else if (decision === REVIEW_STATUSES.APPROVED) {
      setActionMessage("Сіздің мақұлдауыңыз сақталды. Басқа әкімшілердің шешімі күтілуде.")
    } else {
      setActionMessage("Мақала қабылданбады.")
    }
    loadStats(user.id)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="grid gap-6 lg:grid-cols-3 mb-10">
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-500 mb-3">Әкімші панелі</p>
            <h1 className="text-3xl font-bold text-slate-900">Қош келдіңіз, {user?.name || "Әкімші"}</h1>
            <p className="text-slate-600 mt-4">Тек тіркелген және тағайындалған әкімшілерге арналған бет.</p>
          </div>
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
            <p className="text-sm text-slate-500">Жалпы тапсырмалар</p>
            <p className="text-4xl font-bold text-slate-900 mt-4">{totalAssigned}</p>
            <p className="text-slate-500 mt-2">Барлығы тағайындалған мақала</p>
          </div>
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
            <p className="text-sm text-slate-500">Күтіп тұрған мақала</p>
            <p className="text-4xl font-bold text-slate-900 mt-4">{pendingCount}</p>
            <p className="text-slate-500 mt-2">Тексеруге дайын мақала</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Әкімші әрекеттері</h2>
              <p className="text-slate-600 mt-2">Мақалаларды жылдам тексеру және статус қарау.</p>
            </div>
            <Link href="/admin/review" className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-600 transition">
              Тексеруге өту
            </Link>
          </div>

          {actionMessage && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 mb-6">
              {actionMessage}
            </div>
          )}

          {loading ? (
            <p className="text-slate-500">Жүктелуде...</p>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">Күтіп тұрған мақала</p>
                  <p className="text-3xl font-bold text-slate-900 mt-3">{pendingCount}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">Барлығы тағайындалған</p>
                  <p className="text-3xl font-bold text-slate-900 mt-3">{totalAssigned}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                  <p className="text-sm text-slate-500">Публикация үшін қажет</p>
                  <p className="text-3xl font-bold text-slate-900 mt-3">{REQUIRED_ADMIN_APPROVALS}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 border border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Тексеруді күтіп тұрған мақалалар</h3>
                {pendingItems.length === 0 ? (
                  <p className="text-slate-500">Қазіргі уақытта сізге тексеруге мақала тағайындалмаған.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingItems.map(item => {
                      const articleId = item.article?.id || item.article_id
                      return (
                        <div key={item.id} className="rounded-3xl bg-white border border-slate-200 p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <h4 className="text-lg font-bold text-slate-900">{item.article?.title}</h4>
                              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{item.article?.overview}</p>
                              <p className="text-xs text-slate-400 mt-2">
                                Автор: {item.article?.author?.name ?? "Автор"} ·{" "}
                                {ARTICLE_CATEGORIES[item.article?.category as keyof typeof ARTICLE_CATEGORIES] || item.article?.category}
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleDecision(articleId, REVIEW_STATUSES.APPROVED)}
                                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-600 transition"
                              >
                                Қабылдау
                              </button>
                              <button
                                onClick={() => handleDecision(articleId, REVIEW_STATUSES.DECLINED)}
                                className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition"
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
