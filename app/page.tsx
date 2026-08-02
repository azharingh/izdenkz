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

  const principles = [
    {
      num: "01",
      title: "Сапалы мазмұн",
      desc: "Әр мақала жарияланар алдында үш әкімшінің тәуелсіз тексерісінен өтеді.",
    },
    {
      num: "02",
      title: "Ортақ алаң",
      desc: "Оқырмандар мен авторлар бір платформада кездеседі, пікірлеседі, дамиды.",
    },
    {
      num: "03",
      title: "Ашық есік",
      desc: "Жас қаламгерлерге алғашқы мақаласын жариялауға нақты мүмкіндік береміз.",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="hero-bg relative overflow-hidden pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl relative">
            {/* seeking mark */}
            <div className="flex items-center gap-3 mb-8">
              <span className="seek-dot w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-amber-400/70 to-transparent" />
              <span className="text-amber-400/90 text-xs font-medium tracking-[0.3em] uppercase">Ізден</span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              "Оқып тоқығаның көп болса,<span className="text-amber-400"> жеңбейтін жауың жоқ"</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg mb-1 italic">— Бауыржан Момышұлы</p>
            <p className="text-slate-300 text-lg md:text-xl mt-6 mb-10 leading-relaxed max-w-xl">
              Izden — қазақ тіліндегі тәуелсіз журналистика платформасы.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/articles"
                className="group bg-amber-500 hover:bg-amber-400 text-slate-900 px-7 py-3.5 rounded-lg font-semibold text-base transition inline-flex items-center gap-2"
              >
                Мақалаларды оқу
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/submit"
                className="group border border-slate-600 hover:border-amber-400 text-slate-200 hover:text-amber-300 px-7 py-3.5 rounded-lg font-semibold text-base transition inline-flex items-center gap-2"
              >
                Мақала жазу
              </Link>
            </div>

            {/* inline stats, part of hero not a separate boxy band */}
            <div className="flex flex-wrap gap-x-10 gap-y-4 mt-16 pt-8 border-t border-slate-700/60">
              <div>
                <p className="font-heading text-2xl text-amber-400 font-bold">{stats.articles}</p>
                <p className="text-slate-500 text-sm mt-0.5">жарияланған мақала</p>
              </div>
              <div>
                <p className="font-heading text-2xl text-amber-400 font-bold">{stats.authors}</p>
                <p className="text-slate-500 text-sm mt-0.5">автор</p>
              </div>
              <div>
                <p className="font-heading text-2xl text-amber-400 font-bold">100%</p>
                <p className="text-slate-500 text-sm mt-0.5">қазақ тілінде</p>
              </div>
              <div>
                <p className="font-heading text-2xl text-amber-400 font-bold">Тегін</p>
                <p className="text-slate-500 text-sm mt-0.5">барлығына ашық</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission — editorial masthead list, not icon cards */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-amber-600 text-xs font-semibold tracking-[0.3em] uppercase mb-3">Біздің миссия</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 leading-snug">
              Қазақ тілінде сапалы контент жасау, жас журналистерді қолдау және қоғамға пайдалы ақпарат тарату.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 border-t border-slate-200">
            {principles.map((item, i) => (
              <div
                key={item.num}
                className={`py-8 md:py-10 px-1 md:px-8 ${i !== 0 ? "md:border-l border-slate-200" : ""} border-b md:border-b-0 border-slate-200`}
              >
                <p className="font-heading text-4xl text-amber-500/40 font-bold mb-4">{item.num}</p>
                <h3 className="font-heading font-bold text-xl text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-amber-600 text-xs font-semibold tracking-[0.3em] uppercase mb-2">Оқырман таңдауы</p>
              <h2 className="font-heading text-3xl font-bold text-slate-900">Танымал мақалалар</h2>
            </div>
            <Link href="/articles" className="text-slate-600 hover:text-amber-600 text-sm font-medium transition inline-flex items-center gap-1">
              Барлығын көру →
            </Link>
          </div>

          {popular.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center">
              <p className="text-slate-500">Әзірге мақалалар жоқ. Бірінші болып жазыңыз!</p>
              <Link href="/submit" className="inline-block mt-4 text-amber-600 hover:text-amber-700 font-medium">
                Мақала жазу →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {popular.map(article => (
                <Link href={`/articles/${article.id}`} key={article.id} className="group block">
                  <div className="relative bg-white rounded-xl border border-slate-200 p-6 h-full overflow-hidden transition-all group-hover:border-amber-300 group-hover:shadow-lg group-hover:-translate-y-0.5">
                    <span className="absolute left-0 top-0 bottom-0 w-0 bg-amber-500 transition-all duration-300 group-hover:w-1" />
                    <p className="text-xs text-slate-400 mb-3">
                      {new Date(article.created_at).toLocaleDateString("kk-KZ")}
                    </p>
                    <h3 className="font-heading font-bold text-lg text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">{article.overview}</p>
                    <span className="text-sm font-medium text-slate-400 group-hover:text-amber-600 transition-colors inline-flex items-center gap-1">
                      Оқу <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-slate-900 font-heading font-bold">І</span>
                </div>
                <span className="text-white font-heading font-bold text-lg">Izden</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Қазақ тіліндегі тәуелсіз журналистика платформасы.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-12 gap-y-6">
              <div>
                <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-3">Платформа</p>
                <div className="flex flex-col gap-2">
                  <Link href="/articles" className="text-slate-400 hover:text-amber-400 text-sm transition">Мақалалар</Link>
                  <Link href="/feed" className="text-slate-400 hover:text-amber-400 text-sm transition">Лента</Link>
                  <Link href="/submit" className="text-slate-400 hover:text-amber-400 text-sm transition">Материал қосу</Link>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-3">Байланыс</p>
                <div className="flex flex-col gap-2">
                  <Link href="/contact" className="text-slate-400 hover:text-amber-400 text-sm transition">Байланыс</Link>
                  <a href="mailto:izdenkz@gmail.com" className="text-slate-400 hover:text-amber-400 text-sm transition">izdenkz@gmail.com</a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© 2026 Izden. Барлық құқықтар қорғалған.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}