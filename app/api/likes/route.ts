import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"

export async function GET(req: NextRequest) {
  const articleId = req.nextUrl.searchParams.get("articleId")
  const userId = req.nextUrl.searchParams.get("userId")
  if (!articleId) return NextResponse.json({ error: "Missing articleId" }, { status: 400 })

  const { count } = await supabaseAdmin
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("article_id", articleId)

  let liked = false
  if (userId) {
    const { data } = await supabaseAdmin
      .from("likes")
      .select("*")
      .eq("article_id", articleId)
      .eq("user_id", userId)
      .maybeSingle()
    liked = !!data
  }

  return NextResponse.json({ count: count || 0, liked })
}

export async function POST(req: NextRequest) {
  const { articleId, userId } = await req.json()
  if (!articleId || !userId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from("likes")
    .select("*")
    .eq("article_id", articleId)
    .eq("user_id", userId)
    .maybeSingle()

  if (existing) {
    await supabaseAdmin.from("likes").delete()
      .eq("article_id", articleId).eq("user_id", userId)
    return NextResponse.json({ liked: false })
  } else {
    await supabaseAdmin.from("likes").insert({ article_id: articleId, user_id: userId })
    return NextResponse.json({ liked: true })
  }
}