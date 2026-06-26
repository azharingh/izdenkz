import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"
import { createPasswordResetToken, getResetUrl } from "@/lib/resetToken"
import { Resend } from "resend"

const GENERIC_SUCCESS =
  "Егер бұл email тіркелген болса, қалпына келтіру сілтемесі жіберілді."

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email енгізіңіз." }, { status: 400 })
  }

  const normalizedEmail = String(email).trim().toLowerCase()

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id,email,name")
    .eq("email", normalizedEmail)
    .maybeSingle()

  if (user) {
    const token = createPasswordResetToken(normalizedEmail)
    const resetUrl = getResetUrl(token)

    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      try {
        const resend = new Resend(apiKey)
        const from = process.env.RESEND_FROM_EMAIL || "Izden <onboarding@resend.dev>"
        await resend.emails.send({
          from,
          to: normalizedEmail,
          subject: "Izden — құпиясөзді қалпына келтіру",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="color:#0f172a">Құпиясөзді қалпына келтіру</h2>
              <p>Сәлеметсіз бе${user.name ? `, ${user.name}` : ""}!</p>
              <p>Құпиясөзді өзгерту үшін төмендегі батырманы басыңыз. Сілтеме 1 сағатқа жарамды.</p>
              <a href="${resetUrl}" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;margin:16px 0">
                Құпиясөзді өзгерту
              </a>
              <p style="color:#64748b;font-size:14px">Егер сіз бұны сұрамаған болсаңыз, бұл хатты елемеңіз.</p>
            </div>
          `,
        })
      } catch {
        // Do not reveal whether email exists
      }
    }
  }

  return NextResponse.json({ message: GENERIC_SUCCESS })
}
