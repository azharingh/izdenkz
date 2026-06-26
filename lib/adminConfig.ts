export const ADMIN_REVIEWER_EMAILS = [
  // Only these exact email addresses should be admin reviewers.
  // No other user should be able to approve or decline articles.
  "azharittooow365@gmail.com",
  "bakdanazenysbek@gmail.com",
  "azarkusmanova@gmail.com",
] as const

export const REQUIRED_ADMIN_APPROVALS = ADMIN_REVIEWER_EMAILS.length

export const REVIEW_STATUSES = {
  CHECKING: "CHECKING",
  APPROVED: "APPROVED",
  DECLINED: "DECLINED",
}
