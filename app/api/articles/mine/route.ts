import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"

export async function GET(req: NextRequest) {
  const authorId = req.nextUrl.searchParams.get("authorId")
  if (!authorId) {
    return NextResponse.json({ error: "authorId қажет." }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("*")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ articles: data || [] })
}