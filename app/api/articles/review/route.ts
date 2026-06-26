import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"
import { ADMIN_REVIEWER_EMAILS, REQUIRED_ADMIN_APPROVALS, REVIEW_STATUSES } from "@/lib/adminConfig"

export async function PATCH(req: NextRequest) {
  const { articleId, adminId, decision } = await req.json()

  if (!articleId || !adminId || !decision) {
    return NextResponse.json({ error: "Барлық өрістер қажет." }, { status: 400 })
  }

  if (![REVIEW_STATUSES.APPROVED, REVIEW_STATUSES.DECLINED].includes(decision)) {
    return NextResponse.json({ error: "Жарамды шешім беріңіз." }, { status: 400 })
  }

  const { data: adminUser, error: adminError } = await supabaseAdmin
    .from("users")
    .select("id,email,role")
    .eq("id", adminId)
    .maybeSingle()

  if (adminError || !adminUser) {
    return NextResponse.json({ error: "Әкімші анықталған жоқ." }, { status: 403 })
  }

  if (!ADMIN_REVIEWER_EMAILS.includes(adminUser.email.toLowerCase())) {
    return NextResponse.json({ error: "Сізге мақала тексеруге рұқсат жоқ." }, { status: 403 })
  }

  const { data: article, error: articleError } = await supabaseAdmin
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .maybeSingle()

  if (articleError || !article) {
    return NextResponse.json({ error: "Мақала табылмады." }, { status: 404 })
  }

  if (article.status !== REVIEW_STATUSES.CHECKING) {
    return NextResponse.json({ error: "Мақала тексеру процесінде емес." }, { status: 400 })
  }

  const { data: approval, error: approvalError } = await supabaseAdmin
    .from("article_approvals")
    .select("*")
    .eq("article_id", articleId)
    .eq("admin_id", adminId)
    .maybeSingle()

  if (approvalError || !approval) {
    return NextResponse.json({ error: "Сізге бұл мақала тағайындалмаған." }, { status: 403 })
  }

  const { data: updatedApproval, error: updateApprovalError } = await supabaseAdmin
    .from("article_approvals")
    .update({ status: decision })
    .eq("id", approval.id)
    .select()
    .single()

  if (updateApprovalError || !updatedApproval) {
    return NextResponse.json({ error: "Шешімді жазу мүмкін болмады." }, { status: 500 })
  }

  let finalArticle = article

  if (decision === REVIEW_STATUSES.DECLINED) {
    const { data: declinedArticle, error: declineError } = await supabaseAdmin
      .from("articles")
      .update({ status: REVIEW_STATUSES.DECLINED })
      .eq("id", articleId)
      .select()
      .single()

    if (declineError || !declinedArticle) {
      return NextResponse.json({ error: "Мақаланың күйін өзгерту мүмкін болмады." }, { status: 500 })
    }

    finalArticle = declinedArticle
  } else {
    const { data: approvals, error: approvalsError } = await supabaseAdmin
      .from("article_approvals")
      .select("status")
      .eq("article_id", articleId)

    if (approvalsError || !approvals) {
      return NextResponse.json({ error: "Шешімдерді тексеру мүмкін болмады." }, { status: 500 })
    }

    const allApproved = approvals.length >= REQUIRED_ADMIN_APPROVALS && approvals.every(row => row.status === REVIEW_STATUSES.APPROVED)

    if (allApproved) {
      const { data: approvedArticle, error: approveError } = await supabaseAdmin
        .from("articles")
        .update({ status: REVIEW_STATUSES.APPROVED })
        .eq("id", articleId)
        .select()
        .single()

      if (approveError || !approvedArticle) {
        return NextResponse.json({ error: "Мақаланы жариялау мүмкін болмады." }, { status: 500 })
      }

      finalArticle = approvedArticle
    }
  }

  return NextResponse.json({ article: finalArticle, approval: updatedApproval })
}
