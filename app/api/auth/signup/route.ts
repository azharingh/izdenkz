import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabaseServer"
import { signupPayload, toClientUser } from "@/lib/userDb"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password, firstName, lastName, username, dateOfBirth, region, interests } = body

  if (!email || !password) {
    return NextResponse.json({ error: "Email және құпиясөз қажет." }, { status: 400 })
  }

  if (!firstName?.trim() || !lastName?.trim()) {
    return NextResponse.json({ error: "Аты мен тегін енгізіңіз." }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Құпиясөз кемінде 8 таңба болуы керек." }, { status: 400 })
  }

  const normalizedEmail = String(email).trim().toLowerCase()

  const { data: existing, error: existingErr } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle()

  if (existingErr) {
    return NextResponse.json({ error: "Сұрау өңделген жоқ." }, { status: 500 })
  }

  if (existing) {
    return NextResponse.json({ error: "Бұл email бұрыннан тіркелген." }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const base = signupPayload({
    email: normalizedEmail,
    password: hashed,
    firstName,
    lastName,
    interests,
  })

  const insertData: Record<string, unknown> = { ...base, password: hashed }

  if (username?.trim()) insertData.username = username.trim()
  if (region) insertData.region = region
  if (dateOfBirth) {
    const parsedDate = new Date(dateOfBirth)
    if (!Number.isNaN(parsedDate.getTime())) {
      insertData.date_of_birth = parsedDate.toISOString()
    }
  }

  let { data, error } = await supabaseAdmin.from("users").insert(insertData).select().single()

  if (error?.message?.includes("column")) {
    const minimal = {
      name: base.name,
      email: base.email,
      password: hashed,
      role: "USER",
      interests: base.interests,
    }
    const retry = await supabaseAdmin.from("users").insert(minimal).select().single()
    data = retry.data
    error = retry.error
  }

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Тіркелу мүмкін болмады." }, { status: 500 })
  }

  return NextResponse.json({ user: toClientUser(data) })
}
