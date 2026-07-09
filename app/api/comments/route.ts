import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"

export async function GET(req: NextRequest) {
  const articleId = req.nextUrl.searchParams.get("articleId")
  if (!articleId) return NextResponse.json({ error: "Missing articleId" }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from("comments")
    .select("*")
    .eq("article_id", articleId)
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comments: data || [] })
}

export async function POST(req: NextRequest) {
  const { articleId, authorId, authorName, content } = await req.json()
  if (!articleId || !authorId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("comments")
    .insert({
      article_id: articleId,
      author_id: authorId,
      author_name: authorName,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment: data })
}