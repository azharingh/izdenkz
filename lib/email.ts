import { Resend } from "resend"
import { supabaseAdmin } from "@/lib/supabaseServer"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://izden.men"
const FROM = process.env.RESEND_FROM_EMAIL || "Izden <noreply@izden.men>"
const REPLY_TO = "izdenkz@gmail.com"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function layout(heading: string, bodyHtml: string, button?: { label: string; url: string }) {
  const btn = button
    ? `<p style="margin:24px 0"><a href="${button.url}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600">${button.label}</a></p>`
    : ""
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#334155;line-height:1.6">
      <div style="border-bottom:3px solid #f59e0b;padding-bottom:12px;margin-bottom:20px">
        <strong style="font-size:20px;color:#0f172a">Izden</strong>
      </div>
      <h2 style="color:#0f172a;margin:0 0 12px">${heading}</h2>
      ${bodyHtml}
      ${btn}
      <p style="color:#94a3b8;font-size:13px;margin-top:32px;border-top:1px solid #e2e8f0;padding-top:12px">
        Бұл хат Izden платформасындағы әрекетіңізге байланысты автоматты түрде жіберілді. Сұрақтар болса: ${REPLY_TO}
      </p>
    </div>`
}

// Never throws: a failed email must not break signup or article review.
async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set, email skipped")
    return
  }
  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject,
      html,
    })
    if (error) console.error("Resend error:", error)
  } catch (err) {
    console.error("Email send failed:", err)
  }
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const safeName = name ? escapeHtml(name) : ""
  await sendEmail(
    to,
    "Izden-ге қош келдіңіз!",
    layout(
      safeName ? `Қош келдіңіз, ${safeName}!` : "Қош келдіңіз!",
      `<p>Izden — қазақ тіліндегі тәуелсіз журналистика платформасы. Аккаунтыңыз сәтті жасалды.</p>
       <p>Енді мақала оқып, пікір қалдырып, өз материалыңызды жариялауға жібере аласыз.</p>`,
      { label: "Мақала жазу", url: `${SITE_URL}/submit` }
    )
  )
}

type ArticleForEmail = {
  id: string
  title: string
  author_id: string
  co_author_ids?: string[] | null
  is_contest?: boolean | null
}

export async function sendArticleOutcomeEmail(
  article: ArticleForEmail,
  outcome: "APPROVED" | "DECLINED"
) {
  try {
    const ids = [article.author_id, ...(article.co_author_ids || [])]
    const { data: people } = await supabaseAdmin
      .from("users")
      .select("email,name")
      .in("id", ids)

    if (!people?.length) return

    const title = escapeHtml(article.title)

    const subject =
      outcome === "APPROVED"
        ? "Izden — мақалаңыз жарияланды"
        : "Izden — мақалаңыз қабылданбады"

    const heading =
      outcome === "APPROVED" ? "Мақалаңыз жарияланды!" : "Мақалаңыз қабылданбады"

    const body =
      outcome === "APPROVED"
        ? `<p>«${title}» мақаласы барлық әкімшілердің тексерісінен өтіп, сайтта жарияланды.</p>
           ${article.is_contest ? "<p>Мақалаңыз <strong>Izden Maqala</strong> байқауына қатысушы ретінде белгіленді.</p>" : ""}`
        : `<p>«${title}» мақаласы редакция тексерісінен өтпеді.</p>
           <p>Әкімшілер жақын арада қателер мен түзетуді қажет ететін тұстар туралы нұсқаулықты жеке email арқылы жібереді.</p>
           <p>Ескертулерді ескеріп, мақаланы қайта жіберуіңізге болады.</p>`

    const button =
      outcome === "APPROVED"
        ? { label: "Мақаланы ашу", url: `${SITE_URL}/articles/${article.id}` }
        : { label: "Профильге өту", url: `${SITE_URL}/profile` }

    // One email per person, so authors never see each other's addresses.
    await Promise.all(
      people.map(p => sendEmail(p.email, subject, layout(heading, body, button)))
    )
  } catch (err) {
    console.error("Article outcome email failed:", err)
  }
}