export function countWords(html: string): number {
  if (!html) return 0
  const text = html
    .replace(/<(?:br|\/?p|\/?div)[^>]*>/gi, " ") 
    .replace(/<[^>]*>/g, "")                      
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;|&gt;/gi, " ")
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function calculateReadingTime(html: string): number {
  return Math.max(1, Math.ceil(countWords(html) / 180))
}