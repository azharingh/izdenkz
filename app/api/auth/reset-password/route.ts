import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabaseServer"
import { verifyPasswordResetToken } from "@/lib/resetToken"
import { toClientUser } from "@/lib/userDb"

export async function POST(req: NextRequest) {
  const { token, newPassword, confirmPassword } = await req.json()

  if (!token || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "Барлық өрістерді толтырыңыз." }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Құпиясөз кемінде 8 таңба болуы керек." }, { status: 400 })
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Құпиясөздер сәйкес келмейді." }, { status: 400 })
  }

  const verified = verifyPasswordResetToken(token)
  if (!verified) {
    return NextResponse.json(
      { error: "Сілтеме жарамсыз немесе мерзімі өтіп кеткен. Қайта сұраңыз." },
      { status: 400 }
    )
  }

  const { data: user, error: fetchError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", verified.email)
    .maybeSingle()

  if (fetchError || !user) {
    return NextResponse.json({ error: "Пайдаланушы табылмады." }, { status: 404 })
  }

  const hashed = await bcrypt.hash(newPassword, 10)

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("users")
    .update({ password: hashed })
    .eq("id", user.id)
    .select()
    .maybeSingle()

  if (updateError || !updated) {
    return NextResponse.json({ error: "Құпиясөз өзгертілмеді." }, { status: 500 })
  }

  return NextResponse.json({ user: toClientUser(updated) })
}
