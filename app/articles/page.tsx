'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"
import { ARTICLE_FILTER_CATEGORIES } from "@/lib/categories"
import { useRouter } from "next/navigation"

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [category, setCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "APPROVED")
        .order("created_at", { ascending: false })
      setArticles(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let result = articles
    if (category !== "all") result = result.filter(a => a.category === category)
    if (search) result = result.filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.overview.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [category, search, articles])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="mb-8">
          <p className="text-amber-600 text-xs font-semibold tracking-[0.3em] uppercase mb-2">Кітапхана</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">Мақалалар</h1>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Мақала іздеу..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 outline-none bg-white text-sm"
          />
        </div>

        {/* Category chips — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {Object.entries(ARTICLE_FILTER_CATEGORIES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                category === key
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-amber-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse h-44" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center">
            <p className="text-slate-500">Мақалалар табылмады.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(article => (
              <div
                key={article.id}
                onClick={() => router.push(`/articles/${article.id}`)}
                className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden h-full cursor-pointer transition-all hover:border-amber-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <span className="absolute left-0 top-0 bottom-0 w-0 bg-amber-500 transition-all duration-300 group-hover:w-1" />
                <div className="p-5">
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      {ARTICLE_FILTER_CATEGORIES[article.category as keyof typeof ARTICLE_FILTER_CATEGORIES] || article.category}
                    </span>
                    {article.is_contest && (
                      <span className="text-xs font-medium text-white bg-slate-900 px-2 py-0.5 rounded">
                        Izden Maqala
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-1.5 line-clamp-2 group-hover:text-amber-600 transition">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4">{article.overview}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <Link
                      href={`/user/${article.author_id}`}
                      onClick={e => e.stopPropagation()}
                      className="hover:text-amber-600 transition font-medium relative z-10"
                    >
                      {article.author_name}
                    </Link>
                    <span>{new Date(article.created_at).toLocaleDateString("kk-KZ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}