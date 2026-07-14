import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"

export async function POST(req: NextRequest) {
  const { userId, imageBase64, imageUrl } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: "userId қажет." }, { status: 400 })
  }

  let finalUrl = ""

  if (imageUrl?.trim()) {
    // Option A: user pasted a URL directly
    finalUrl = imageUrl.trim()
  } else if (imageBase64) {
    // Option B: user uploaded a file, stored as base64 data URL
    const matches = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!matches) {
      return NextResponse.json({ error: "Жарамсыз сурет форматы." }, { status: 400 })
    }
    const mimeType = matches[1]
    const base64Data = matches[2]
    const ext = mimeType.split("/")[1]
    const buffer = Buffer.from(base64Data, "base64")
    const fileName = `${userId}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(fileName, buffer, { contentType: mimeType, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(fileName)

    finalUrl = publicUrlData.publicUrl
  } else {
    return NextResponse.json({ error: "Сурет таңдалмады." }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ avatar_url: finalUrl })
    .eq("id", userId)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Сақталмады." }, { status: 500 })
  }

  return NextResponse.json({ avatarUrl: finalUrl })
}