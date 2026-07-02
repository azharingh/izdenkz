import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabaseServer"

export async function PATCH(req: NextRequest) {
  const { id, currentPassword, newPassword } = await req.json()

  if (!id || !currentPassword || !newPassword) {
    return NextResponse.json({ error: "Барлық өрістер қажет." }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: "Пайдаланушы табылмады." }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Пайдаланушы табылмады." }, { status: 404 })

  const match = await bcrypt.compare(currentPassword, data.password || "")
  if (!match) return NextResponse.json({ error: "Ағымдағы құпиясөз қате." }, { status: 401 })

  const hashed = await bcrypt.hash(newPassword, 10)

  const { data: updated, error: updErr } = await supabaseAdmin
    .from("users")
    .update({ password: hashed })
    .eq("id", id)
    .select()
    .maybeSingle()

  if (updErr) return NextResponse.json({ error: updErr.message || "Қате" }, { status: 500 })

  const user = updated || null
  if (user && user.password) delete user.password

  return NextResponse.json({ user })
}
