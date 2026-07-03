import { Resend } from "resend"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const { error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: "izdenkz@gmail.com",
      replyTo: email,
      subject: `Жаңа хабарлама: ${name}`,
      text: `Аты-жөні: ${name}\nEmail: ${email}\n\nХабарлама:\n${message}`,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Server error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}