import Link from "next/link"
import Navbar from "@/components/Navbar"
import { supabase } from "@/lib/supabase"

export default async function HomePage() {
  const { data: articles } = await supabase
    .from("articles")
    .select("*, author(name)")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false })

  const popular = articles?.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)).slice(0, 3) || []

  const stats = {
    articles: articles?.length || 0,
    authors: new Set(articles?.map(a => a.author_id)).size || 0,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="hero-bg min-h-[500px] flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              "Оқып тоқығаның көп болса,<span className="text-amber-400">жеңбейтін жауың жоқ"</span>
            </h1>
            <h2 className="text-slate-200 text-lg md:text-xl mb-8 leading-relaxed">
              Бауыржан Момышұлы
            </h2>
            <p className="text-slate-300 text-lg md:text-xl mb-8 leading-relaxed">
              Izden — қазақ тіліндегі тәуелсіз журналистика платформасы.
            </p>
            <Link href="/articles" className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-3 rounded-lg font-semibold text-lg transition inline-flex items-center gap-2">
              Мақалаларды оқу →
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">Біздің миссия</h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Қазақ тілінде сапалы контент жасау, жас журналистерді қолдау және қоғамға пайдалы ақпарат тарату.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "✍️", title: "Сапалы мазмұн", desc: "Әр мақала модерация арқылы тексеріледі" },
              { icon: "👥", title: "Қауымдастық", desc: "Оқырмандар мен авторлар бір платформада" },
              { icon: "📈", title: "Даму", desc: "Жас авторларға мүмкіндік береміз" },
            ].map(item => (
              <div key={item.title} className="text-center p-6">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                  {item.icon}
                </div>
                <h3 className="font-heading font-bold text-xl text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-400">{stats.articles}</p>
              <p className="text-slate-400 mt-1">Мақалалар</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-400">{stats.authors}</p>
              <p className="text-slate-400 mt-1">Авторлар</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-400">100%</p>
              <p className="text-slate-400 mt-1">Қазақ тілінде</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-amber-400">Тегін</p>
              <p className="text-slate-400 mt-1">Барлығына ашық</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-slate-900 mb-10 text-center">Танымал мақалалар</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {popular.length === 0 ? (
              <p className="text-slate-500 text-center col-span-3">Әзірге мақалалар жоқ. Бірінші болып жазыңыз!</p>
            ) : popular.map(article => (
              <Link href={`/articles/${article.id}`} key={article.id}>
                <div className="bg-white rounded-xl border border-slate-200 p-5 card-hover cursor-pointer">
                  <h3 className="font-heading font-bold text-lg text-slate-900 mt-1 mb-2">{article.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2">{article.overview}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-heading font-bold">І</span>
              </div>
              <span className="text-white font-heading font-bold text-lg">Izden</span>
            </div>
            <p className="text-slate-500 text-sm">© 2026 Izden. Барлық құқықтар қорғалған.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}