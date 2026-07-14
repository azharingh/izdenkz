import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"
import { ADMIN_REVIEWER_EMAILS } from "@/lib/adminConfig"

export async function GET(req: NextRequest) {
  const adminId = req.nextUrl.searchParams.get("adminId")

  if (!adminId) {
    return NextResponse.json({ error: "adminId қажет." }, { status: 400 })
  }

  const { data: adminUser, error: adminError } = await supabaseAdmin
    .from("users")
    .select("id,email")
    .eq("id", adminId)
    .maybeSingle()

  if (adminError || !adminUser || !ADMIN_REVIEWER_EMAILS.includes(adminUser.email.toLowerCase())) {
    return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
  .from("article_approvals")
  .select("id,status,article_id,articles(id,title,overview,content,category,created_at,status,author:users!author_id(name))")
  .eq("admin_id", adminId)
  .order("created_at", { ascending: false })

  if (error) {
    console.error("pending fetch error:", error)
    return NextResponse.json({ error: "Тексеру тізімін жүктеу мүмкін болмады." }, { status: 500 })
  }

  return NextResponse.json({ data })
}