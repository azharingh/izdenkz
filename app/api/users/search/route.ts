import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query")?.trim().toLowerCase()
  if (!query) {
    return NextResponse.json({ error: "Сұрау қажет." }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, name, email, username")
    .or(`email.eq.${query},username.eq.${query}`)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: "Пайдаланушы табылмады." }, { status: 404 })
  }

  return NextResponse.json({ user: data })
}