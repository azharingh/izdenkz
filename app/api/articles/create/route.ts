import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"
import { ADMIN_REVIEWER_EMAILS, REVIEW_STATUSES } from "@/lib/adminConfig"

export async function POST(req: NextRequest) {
  const { title, overview, content, category, authorId } = await req.json()

  if (!title || !overview || !content || !authorId) {
    return NextResponse.json({ error: "Барлық өрістер қажет." }, { status: 400 })
  }

  // Look up the author's name
  const { data: authorUser, error: authorError } = await supabaseAdmin
    .from("users")
    .select("name")
    .eq("id", authorId)
    .maybeSingle()

  if (authorError || !authorUser) {
    return NextResponse.json({ error: "Автор табылмады." }, { status: 400 })
  }

  const adminCount = ADMIN_REVIEWER_EMAILS.length

  const { data: admins, error: adminError } = await supabaseAdmin
    .from("users")
    .select("id,email,role")
    .in("email", [...ADMIN_REVIEWER_EMAILS])

  if (adminError) {
    return NextResponse.json({ error: "Әкімшілер жүктелмеді." }, { status: 500 })
  }

  if (!admins || admins.length !== adminCount) {
    const missing = ADMIN_REVIEWER_EMAILS.filter(
      email => !admins?.some(a => a.email === email)
    )
    return NextResponse.json(
      {
        error: `Барлық ${adminCount} әкімші тіркелмеген. Қажет email: ${missing.join(", ")}`,
      },
      { status: 400 }
    )
  }

  const { data: article, error: articleError } = await supabaseAdmin
    .from("articles")
    .insert({
      title,
      overview,
      content,
      category: category || "lessons",
      author_id: authorId,
      author_name: authorUser.name,
      status: REVIEW_STATUSES.CHECKING,
    })
    .select()
    .single()

  if (articleError || !article) {
    return NextResponse.json({ error: articleError?.message || "Мақала жіберілмеді." }, { status: 500 })
  }

  const approvals = admins.map(admin => ({
    article_id: article.id,
    admin_id: admin.id,
    status: REVIEW_STATUSES.CHECKING,
  }))

  const { error: approvalError } = await supabaseAdmin
    .from("article_approvals")
    .insert(approvals)

  if (approvalError) {
    console.error("Approval insert error:", approvalError)
    await supabaseAdmin.from("articles").delete().eq("id", article.id)
    return NextResponse.json({ error: approvalError.message }, { status: 500 })
  }

  return NextResponse.json({ article })
}