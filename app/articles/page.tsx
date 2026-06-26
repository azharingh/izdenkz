'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"

import { ARTICLE_FILTER_CATEGORIES } from "@/lib/categories"

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [category, setCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("articles")
        .select("*, author(name)")
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
        <h1 className="font-heading text-3xl font-bold text-slate-900 mb-6">Мақалалар</h1>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Мақала іздеу..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:border-amber-500 outline-none bg-white"
          />
          <div className="flex gap-2 flex-wrap">
            {Object.entries(ARTICLE_FILTER_CATEGORIES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  category === key
                    ? "bg-amber-500 text-slate-900"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <p className="text-center text-slate-500 py-20">Жүктелуде...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-20">Мақалалар табылмады.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(article => (
              <Link href={`/articles/${article.id}`} key={article.id}>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-hover cursor-pointer group">
                  <div className="h-2 bg-amber-500 group-hover:h-3 transition-all"></div>
                  <div className="p-5">
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      {ARTICLE_FILTER_CATEGORIES[article.category as keyof typeof ARTICLE_FILTER_CATEGORIES] || article.category}
                    </span>
                    <h3 className="font-heading font-bold text-lg text-slate-900 mt-2 mb-1 line-clamp-2 group-hover:text-amber-600 transition">
                      {article.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-3">{article.overview}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{article.author?.name ?? article.author_name}</span>
                      <span>{new Date(article.created_at).toLocaleDateString("kk-KZ")}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}