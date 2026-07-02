import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Izden — Қазақ журналистикасы",
  description: "Білім іздеу — болашаққа жол",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="kk" data-scroll-behavior="smooth">
      <body>
        {children}
      </body>
    </html>
  )
}