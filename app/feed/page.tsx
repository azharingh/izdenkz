import Navbar from "@/components/Navbar"
import { supabase } from "@/lib/supabase"
import FeedGrid from "@/components/FeedGrid"

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="mb-10">
          <p className="text-amber-600 text-xs font-semibold tracking-[0.3em] uppercase mb-2">Жаңарту</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900">Лента</h1>
          <p className="text-slate-600 mt-3 max-w-xl">
            Соңғы жарияланған мақалалар мен оқиғалар осы жерде.
          </p>
        </div>

        <FeedGrid articles={articles || []} />
      </div>
    </div>
  )
}