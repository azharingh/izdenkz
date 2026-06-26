import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"
import { profileUpdatePayload, toClientUser } from "@/lib/userDb"

export async function PATCH(req: NextRequest) {
  const { id, firstName, lastName, username, dateOfBirth, region } = await req.json()

  if (!id) return NextResponse.json({ error: "ID қажет." }, { status: 400 })
  if (!firstName || !lastName) return NextResponse.json({ error: "Аты-жөні толық болуы керек." }, { status: 400 })

  const updates = profileUpdatePayload({ firstName, lastName, username, dateOfBirth, region })

  let { data, error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle()

  if (error?.message?.includes("column")) {
    const minimal = { name: updates.name as string }
    const retry = await supabaseAdmin
      .from("users")
      .update(minimal)
      .eq("id", id)
      .select()
      .maybeSingle()
    data = retry.data
    error = retry.error
  }

  if (error) {
    return NextResponse.json({ error: error.message || "Жаңарту мүмкін болмады." }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: "Пайдаланушы табылмады." }, { status: 404 })
  }

  return NextResponse.json({ user: toClientUser(data) })
}
