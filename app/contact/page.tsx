"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !message) {
      setStatus("error")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })

      if (!res.ok) throw new Error("Failed")

      setStatus("success")
      setName("")
      setEmail("")
      setMessage("")
    } catch {
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="rounded-3xl bg-white border border-slate-200 p-10 shadow-sm">
          <h1 className="font-heading text-4xl font-bold text-slate-900 mb-4">Байланыс</h1>
          <p className="text-slate-600 text-lg mb-8">
            Сұрақтарыңыз болса немесе бізбен байланысу қажет болса, төмендегі форманы толтырыңыз.
          </p>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Аты-жөні</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 bg-white text-slate-900 outline-none focus:border-amber-500"
                  placeholder="Аты-жөніңіз"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 bg-white text-slate-900 outline-none focus:border-amber-500"
                  placeholder="Email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Хабарлама</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 bg-white text-slate-900 outline-none focus:border-amber-500"
                  placeholder="Хабарламаңызды жазыңыз"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-3 rounded-2xl font-semibold transition disabled:opacity-50"
              >
                {loading ? "Жіберілуде..." : "Жіберу"}
              </button>
              {status === "success" && (
                <p className="text-emerald-700 text-sm">Сіздің хабарламаңыз қабылданды. Біз жақын арада жауап береміз.</p>
              )}
              {status === "error" && (
                <p className="text-rose-700 text-sm">Барлық өрістерді толтырыңыз немесе қайталап көріңіз.</p>
              )}
            </form>

            <div className="rounded-3xl bg-slate-50 border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Офиске хабарласу</h2>
              <p className="text-slate-600 mb-3">Email: <a href="mailto:izdenkz@gmail.com" className="text-amber-500">izdenkz@gmail.com</a></p>
              <p className="text-slate-600">Орналасқан жері: Астана,Қазақстан</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}