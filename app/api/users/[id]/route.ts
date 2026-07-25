import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id, name, avatar_url")
    .eq("id", id)
    .maybeSingle()

  if (userError || !user) {
    return NextResponse.json({ error: "Пайдаланушы табылмады." }, { status: 404 })
  }

  const { data: articles, error: articlesError } = await supabaseAdmin
    .from("articles")
    .select("id, title, overview, category, created_at")
    .eq("author_id", id)
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false })

  return NextResponse.json({
    user,
    articles: articlesError ? [] : articles || [],
  })
}