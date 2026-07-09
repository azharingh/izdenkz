import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"

export async function GET(req: NextRequest) {
  const articleId = req.nextUrl.searchParams.get("articleId")
  const userId = req.nextUrl.searchParams.get("userId")
  const authorId = req.nextUrl.searchParams.get("authorId")

  if (articleId) {
    const { count, error: countError } = await supabaseAdmin
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("article_id", articleId)

    if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

    let liked = false
    if (userId) {
      const { data } = await supabaseAdmin
        .from("likes")
        .select("id")
        .eq("article_id", articleId)
        .eq("user_id", userId)
        .maybeSingle()
      liked = !!data
    }

    return NextResponse.json({ count: count || 0, liked })
  }

  if (authorId) {
    const { data: articles, error: articlesError } = await supabaseAdmin
      .from("articles")
      .select("id")
      .eq("author_id", authorId)

    if (articlesError) return NextResponse.json({ error: articlesError.message }, { status: 500 })
    if (!articles?.length) return NextResponse.json({ count: 0 })

    const ids = articles.map(a => a.id)
    const { count, error: countError } = await supabaseAdmin
      .from("likes")
      .select("*", { count: "exact", head: true })
      .in("article_id", ids)

    if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })
    return NextResponse.json({ count: count || 0 })
  }

  return NextResponse.json({ error: "Missing articleId or authorId" }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const { articleId, userId } = await req.json()
  if (!articleId || !userId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const { data: article, error: articleError } = await supabaseAdmin
    .from("articles")
    .select("id,status")
    .eq("id", articleId)
    .maybeSingle()

  if (articleError || !article) {
    return NextResponse.json({ error: "Мақала табылмады." }, { status: 404 })
  }

  if (article.status !== "APPROVED") {
    return NextResponse.json({ error: "Жарияланбаған мақалаға лайк қоюға болмайды." }, { status: 400 })
  }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("likes")
    .select("id")
    .eq("article_id", articleId)
    .eq("user_id", userId)
    .maybeSingle()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  if (existing) {
    const { error: deleteError } = await supabaseAdmin
      .from("likes")
      .delete()
      .eq("article_id", articleId)
      .eq("user_id", userId)

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })
    return NextResponse.json({ liked: false })
  }

  const { error: insertError } = await supabaseAdmin
    .from("likes")
    .insert({ article_id: articleId, user_id: userId })

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
  return NextResponse.json({ liked: true })
}
