import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"
import { isAdminEmail } from "@/lib/isAdmin"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = req.nextUrl.searchParams.get("userId")
  const userEmail = req.nextUrl.searchParams.get("userEmail")

  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: "Мақала табылмады." }, { status: 404 })
  }

  const isAuthor = userId === data.author_id
  const isAdmin = isAdminEmail(userEmail || undefined)
  const canView = data.status === "APPROVED" || isAuthor || isAdmin

  if (!canView) {
    return NextResponse.json({ error: "Бұл мақала әлі жарияланбаған." }, { status: 403 })
  }

  return NextResponse.json({ article: data })
}