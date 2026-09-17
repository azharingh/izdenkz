export function calculateReadingTime(html: string): number {
  if (!html) return 1
  const text = html.replace(/<[^>]*>/g, " ")
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const wordsPerMinute = 180
  const minutes = Math.ceil(words / wordsPerMinute)
  return Math.max(1, minutes)
}