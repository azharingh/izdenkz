import Link from "next/link"
import Navbar from "@/components/Navbar"

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-slate-900 mb-3">{title}</h2>
      <div className="space-y-3 text-slate-700 leading-relaxed">{children}</div>
    </section>
  )
}

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <p className="text-amber-600 text-xs font-semibold tracking-[0.3em] uppercase mb-2">Құқықтық ақпарат</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-sm text-slate-500 mb-8">Соңғы жаңарту: {updated}</p>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 space-y-8">
          {children}
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/terms" className="text-slate-500 hover:text-amber-600 transition">Қолданушы келісімі</Link>
          <Link href="/privacy" className="text-slate-500 hover:text-amber-600 transition">Құпиялылық саясаты</Link>
          <Link href="/contact" className="text-slate-500 hover:text-amber-600 transition">Байланыс</Link>
        </div>
      </div>
    </div>
  )
}