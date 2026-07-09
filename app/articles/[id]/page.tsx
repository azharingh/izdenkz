'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"
import { ARTICLE_CATEGORIES } from "@/lib/categories"
import { isAdminEmail } from "@/lib/isAdmin"

export default function ArticlePage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : params.id?.[0]
  const router = useRouter()
  const [article, setArticle] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [likesCount, setLikesCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    if (!id) return
    const stored = localStorage.getItem("izden_user")
    const parsedUser = stored ? JSON.parse(stored) : null
    if (stored) setUser(parsedUser)
    loadArticle(parsedUser)
    loadComments()
    loadLikes()
  }, [id])

  async function loadArticle(currentUser: any) {
    if (!id) return
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single()

    if (!data) {
      setArticle(null)
      setLoading(false)
      return
    }

    const isAuthor = currentUser?.id === data.author_id
    const isAdmin = isAdminEmail(currentUser?.email)
    const canView = data.status === "APPROVED" || isAuthor || isAdmin

    if (!canView) {
      setAccessDenied(true)
      setArticle(null)
    } else {
      setArticle(data)
      setAccessDenied(false)
    }
    setLoading(false)
  }

  async function loadComments() {
    if (!id) return
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("article_id", id)
      .order("created_at", { ascending: true })
    setComments(data || [])
  }

  async function loadLikes() {
    if (!id) return
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("article_id", id)
    setLikesCount(count || 0)

    const stored = localStorage.getItem("izden_user")
    if (stored) {
      const u = JSON.parse(stored)
      const { data } = await supabase
        .from("likes")
        .select("*")
        .eq("article_id", id)
        .eq("user_id", u.id)
        .maybeSingle()
      setLiked(!!data)
    }
  }

  async function toggleLike() {
    if (!user || !id) return router.push("/auth")
    if (liked) {
      await supabase.from("likes").delete()
        .eq("article_id", id).eq("user_id", user.id)
      setLikesCount(c => c - 1)
      setLiked(false)
    } else {
      await supabase.from("likes").insert({ article_id: id, user_id: user.id })
      setLikesCount(c => c + 1)
      setLiked(true)
    }
  }

  async function addComment() {
    if (!user || !commentText.trim() || !id) return
    await supabase.from("comments").insert({
      article_id: id,
      author_id: user.id,
      author_name: user.name,
      content: commentText.trim(),
    })
    setCommentText("")
    loadComments()
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <p className="text-center text-slate-500 py-40">Жүктелуде...</p>
    </div>
  )

  if (accessDenied) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <p className="text-center text-slate-500 py-40">Бұл мақала әлі жарияланбаған.</p>
    </div>
  )

  if (!article) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <p className="text-center text-slate-500 py-40">Мақала табылмады.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        <Link href="/articles" className="text-amber-600 hover:text-amber-700 font-medium mb-6 inline-flex items-center gap-1">
          ← Артқа
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
            {ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category}
          </span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-3">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-500 pb-6 border-b border-slate-200">
            <span className="font-medium text-slate-700">{article.author_name}</span>
            <span>{new Date(article.created_at).toLocaleDateString("kk-KZ")}</span>
          </div>

          <div className="prose max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap mt-6">
            {article.content}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                liked
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "border-slate-300 text-slate-600 hover:border-rose-200 hover:text-rose-600"
              }`}
            >
              {liked ? "❤️" : "🤍"} {likesCount}
            </button>
            <span className="text-slate-500 text-sm">💬 {comments.length} пікір</span>
          </div>

          {user ? (
            <div className="flex gap-3">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addComment()}
                placeholder="Пікіріңізді жазыңыз..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:border-amber-500 outline-none"
              />
              <button
                onClick={addComment}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2.5 rounded-lg font-medium transition"
              >
                Жіберу
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Пікір қалдыру үшін{" "}
              <Link href="/auth" className="text-amber-600 underline">жүйеге кіріңіз</Link>.
            </p>
          )}

          <div className="space-y-3 mt-4">
            {comments.map(c => (
              <div key={c.id} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900">{c.author_name}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(c.created_at).toLocaleDateString("kk-KZ")}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
