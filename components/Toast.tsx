"use client"

import { useEffect } from "react"

type ToastProps = {
  message: string
  type?: "success" | "error" | "info"
  open: boolean
  onClose: () => void
}

export default function Toast({ message, type = "info", open, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => onClose(), 4000)
    return () => clearTimeout(t)
  }, [open, onClose])

  if (!open) return null

  const bg = type === "success" ? "bg-emerald-600" : type === "error" ? "bg-rose-600" : "bg-slate-800"

  return (
    <div className={`fixed right-6 bottom-6 z-50 ${bg} text-white px-4 py-2 rounded-lg shadow-lg`}>
      <div className="flex items-center gap-3">
        <div className="text-sm">{message}</div>
        <button onClick={onClose} className="text-sm opacity-80 hover:opacity-100">✕</button>
      </div>
    </div>
  )
}
