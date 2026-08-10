'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ARTICLE_CATEGORIES } from "@/lib/categories"

function relativeTime(dateString: string) {
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return "дәл қазір"
  if (diffMin < 60) return `${diffMin} мин бұрын`
  if (diffHr < 24) return `${diffHr} сағ бұрын`
  if (diffDay < 7) return `${diffDay} күн бұрын`
  return date.toLocaleDateString("kk-KZ")
}

export default function FeedGrid({ articles }: { articles: any[] }) {
  const [sort, setSort] = useState<"latest" | "popular">("latest")
  const router = useRouter()

  const sorted = [...articles].sort((a, b) => {
    if (sort === "popular") return (b.likes_count || 0) - (a.likes_count || 0)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  if (articles.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-dashed border-slate-300 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Лентада әлі мақала жоқ</h2>
        <p className="text-slate-600">Мақалалар қосылғаннан кейін лента автоматты түрде жаңартылады.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Sort toggle */}
      <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 mb-8">
        <button
          onClick={() => setSort("latest")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            sort === "latest" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Ең жаңа
        </button>
        <button
          onClick={() => setSort("popular")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            sort === "popular" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Танымал
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {sorted.map((article, i) => (
          <div
            key={article.id}
            onClick={() => router.push(`/articles/${article.id}`)}
            className={`group relative bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer transition-all hover:border-amber-300 hover:shadow-lg hover:-translate-y-0.5 ${
              i === 0 ? "sm:col-span-2" : ""
            }`}
          >
            <span className="absolute left-0 top-0 bottom-0 w-0 bg-amber-500 transition-all duration-300 group-hover:w-1.5" />
            <div className={i === 0 ? "p-6 sm:p-10" : "p-6"}>
              <div className="flex items-center flex-wrap gap-2 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  {ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category}
                </span>
                {article.is_contest && (
                  <span className="text-xs font-semibold uppercase tracking-wide text-white bg-slate-900 px-3 py-1 rounded-full">
                    Izden Maqala
                  </span>
                )}
                <span className="text-xs text-slate-400 ml-auto">{relativeTime(article.created_at)}</span>
              </div>

              <h2 className={`font-heading font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition leading-snug ${
                i === 0 ? "text-2xl sm:text-3xl" : "text-lg"
              }`}>
                {article.title}
              </h2>

              <p className={`text-slate-600 leading-relaxed mb-5 ${i === 0 ? "line-clamp-3 max-w-2xl text-base" : "line-clamp-2 text-sm"}`}>
                {article.overview}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-amber-700">
                      {(article.author_name || "А").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <Link
                    href={`/user/${article.author_id}`}
                    onClick={e => e.stopPropagation()}
                    className="text-sm font-medium text-slate-700 hover:text-amber-600 transition relative z-10"
                  >
                    {article.author_name ?? "Автор"}
                  </Link>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {typeof article.likes_count === "number" && (
                    <span className="inline-flex items-center gap-1">❤️ {article.likes_count}</span>
                  )}
                  <span className="text-slate-400 group-hover:text-amber-600 transition inline-flex items-center gap-1 font-medium">
                    Оқу <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}