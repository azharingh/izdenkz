import Link from "next/link"
import Navbar from "@/components/Navbar"
import { supabase } from "@/lib/supabase"
import { ARTICLE_CATEGORIES } from "@/lib/categories"

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false })
    .limit(12)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="rounded-3xl bg-white border border-slate-200 p-10 shadow-sm mb-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-4">Жаңалықтар лентасы</h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            Соңғы жарияланған мақалалар мен оқиғалар Izden лентасында. Біздің платформада ең жаңа мақалаларды қарап шығыңыз.
          </p>
        </div>

        {articles && articles.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map(article => (
              <Link href={`/articles/${article.id}`} key={article.id}>
                <article className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-amber-300 transition cursor-pointer">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      {ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category}
                    </span>
                    <span className="text-xs text-slate-500">{new Date(article.created_at).toLocaleDateString("kk-KZ")}</span>
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition">
                    {article.title}
                  </h2>
                  <p className="text-slate-600 line-clamp-3 mb-5">{article.overview}</p>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{article.author_name ?? "Автор"}</span>
                    <span>Толығырақ →</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Лентада әлі мақала жоқ</h2>
            <p className="text-slate-600">Мақалалар қосылғаннан кейін лента автоматты түрде жаңартылады.</p>
          </div>
        )}
      </div>
    </div>
  )
}
