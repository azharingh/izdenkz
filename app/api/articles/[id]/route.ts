import { NextRequest, NextResponse } from "next/server"
import sanitizeHtml from "sanitize-html"
import { supabaseAdmin } from "@/lib/supabaseServer"
import { isAdminEmail } from "@/lib/isAdmin"
import { ADMIN_REVIEWER_EMAILS, REVIEW_STATUSES } from "@/lib/adminConfig"

function sanitize(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["b", "strong", "i", "em", "u", "br", "p", "div"],
    allowedAttributes: {},
  })
}

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

  const { data: author } = await supabaseAdmin
    .from("users")
    .select("email")
    .eq("id", data.author_id)
    .maybeSingle()

  return NextResponse.json({
    article: { ...data, author_email: author?.email || null },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { authorId, title, overview, content, category, action } = await req.json()

  if (!authorId || !title || !overview || !content) {
    return NextResponse.json({ error: "Барлық өрістер қажет." }, { status: 400 })
  }

  const { data: article, error: articleError } = await supabaseAdmin
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (articleError || !article) {
    return NextResponse.json({ error: "Мақала табылмады." }, { status: 404 })
  }

  if (article.author_id !== authorId) {
    return NextResponse.json({ error: "Бұл мақаланы өңдеуге рұқсат жоқ." }, { status: 403 })
  }

  if (article.status !== REVIEW_STATUSES.DRAFT) {
    return NextResponse.json({ error: "Тек драфт мақалаларды өңдеуге болады." }, { status: 400 })
  }

  const cleanContent = sanitize(content)

  if (action === "submit") {
    const adminCount = ADMIN_REVIEWER_EMAILS.length
    const { data: admins, error: adminError } = await supabaseAdmin
      .from("users")
      .select("id,email,role")
      .in("email", [...ADMIN_REVIEWER_EMAILS])

    if (adminError || !admins || admins.length !== adminCount) {
      return NextResponse.json({ error: "Әкімшілер жүктелмеді." }, { status: 500 })
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("articles")
      .update({
        title, overview, content: cleanContent, category: category || article.category,
        status: REVIEW_STATUSES.CHECKING,
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError || !updated) {
      return NextResponse.json({ error: updateError?.message || "Жіберілмеді." }, { status: 500 })
    }

    const approvals = admins.map(admin => ({
      article_id: id,
      admin_id: admin.id,
      status: REVIEW_STATUSES.CHECKING,
    }))

    const { error: approvalError } = await supabaseAdmin.from("article_approvals").insert(approvals)
    if (approvalError) {
      return NextResponse.json({ error: approvalError.message }, { status: 500 })
    }

    return NextResponse.json({ article: updated })
  }

  // action === "draft" (just save changes, stay a draft)
  const { data: updated, error: updateError } = await supabaseAdmin
    .from("articles")
    .update({ title, overview, content: cleanContent, category: category || article.category })
    .eq("id", id)
    .select()
    .single()

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message || "Сақталмады." }, { status: 500 })
  }

  return NextResponse.json({ article: updated })
}