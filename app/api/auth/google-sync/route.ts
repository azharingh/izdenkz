import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"
import { toClientUser } from "@/lib/userDb"

export async function POST(req: NextRequest) {
  const { email, name, avatarUrl } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email табылмады." }, { status: 400 })
  }

  const normalizedEmail = String(email).trim().toLowerCase()

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json({ error: "Сұрау өңделген жоқ." }, { status: 500 })
  }

  if (existing) {
    return NextResponse.json({ user: toClientUser(existing) })
  }

  const nameParts = (name || "").trim().split(" ")
  const firstName = nameParts[0] || "Қолданушы"
  const lastName = nameParts.slice(1).join(" ") || ""

  const { data: created, error: createError } = await supabaseAdmin
    .from("users")
    .insert({
      email: normalizedEmail,
      name: name || normalizedEmail,
      first_name: firstName,
      last_name: lastName,
      role: "USER",
      avatar_url: avatarUrl || null,
      password: null,
    })
    .select()
    .single()

  if (createError || !created) {
    return NextResponse.json({ error: createError?.message || "Аккаунт жасалмады." }, { status: 500 })
  }

  return NextResponse.json({ user: toClientUser(created) })
}