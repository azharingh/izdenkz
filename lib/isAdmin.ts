import { ADMIN_REVIEWER_EMAILS } from "@/lib/adminConfig"

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return (ADMIN_REVIEWER_EMAILS as readonly string[]).includes(email.trim().toLowerCase())
}
