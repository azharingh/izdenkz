'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { ARTICLE_CATEGORIES } from "@/lib/categories"

export default function PublicUserProfile() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : params.id?.[0]
  const [user, setUser] = useState<any>(null)
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/users/${id}`)
      .then(res => {
        if (!res.ok) {
          setNotFound(true)
          setLoading(false)
          return null
        }
        return res.json()
      })
      .then(json => {
        if (!json) return
        setUser(json.user)
        setArticles(json.articles || [])
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <p className="text-center text-slate-500 py-40">Жүктелуде...</p>
    </div>
  )

  if (notFound || !user) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <p className="text-center text-slate-500 py-40">Пайдаланушы табылмады.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-slate-900">{user.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-slate-500 text-sm mt-1">{articles.length} жарияланған мақала</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading text-xl font-bold text-slate-900 mb-4">Мақалалары</h2>
          {articles.length === 0 ? (
            <p className="text-slate-500 text-sm">Әзірге жарияланған мақала жоқ.</p>
          ) : (
            <div className="space-y-3">
              {articles.map(a => (
                <Link
                  href={`/articles/${a.id}`}
                  key={a.id}
                  className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                >
                  <p className="font-medium text-slate-900">{a.title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {ARTICLE_CATEGORIES[a.category as keyof typeof ARTICLE_CATEGORIES] || a.category} ·{" "}
                    {new Date(a.created_at).toLocaleDateString('kk-KZ')}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}