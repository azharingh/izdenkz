import { createHmac, timingSafeEqual } from "crypto"

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.PASSWORD_RESET_SECRET
  if (!secret) throw new Error("PASSWORD_RESET_SECRET is not configured")
  return secret
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url")
}

export function createPasswordResetToken(email: string): string {
  const payload = JSON.stringify({
    email: email.trim().toLowerCase(),
    exp: Date.now() + TOKEN_TTL_MS,
  })
  const encoded = Buffer.from(payload).toString("base64url")
  return `${encoded}.${sign(encoded)}`
}

export function verifyPasswordResetToken(token: string): { email: string } | null {
  try {
    const [encoded, signature] = token.split(".")
    if (!encoded || !signature) return null

    const expected = sign(encoded)
    const a = Buffer.from(signature)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null

    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"))
    if (!payload.email || typeof payload.exp !== "number") return null
    if (Date.now() > payload.exp) return null

    return { email: String(payload.email).toLowerCase() }
  } catch {
    return null
  }
}

export function getResetUrl(token: string): string {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000"
  return `${base.replace(/\/$/, "")}/auth/reset-password?token=${encodeURIComponent(token)}`
}
