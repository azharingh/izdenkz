import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabaseServer"
import { toClientUser } from "@/lib/userDb"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email және құпиясөз қажет." }, { status: 400 })
  }

  const normalizedEmail = String(email).trim().toLowerCase()

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: "Сұрау өңделген жоқ." }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: "Email немесе құпиясөз қате." }, { status: 401 })
  }

  const match = await bcrypt.compare(password, data.password || "")
  if (!match) {
    return NextResponse.json({ error: "Email немесе құпиясөз қате." }, { status: 401 })
  }

  return NextResponse.json({ user: toClientUser(data) })
}
