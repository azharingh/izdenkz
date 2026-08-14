'use client'

import { useRef, useEffect } from "react"

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (ref.current && !initialized.current) {
      ref.current.innerHTML = value || ""
      initialized.current = true
    }
  }, [value])

  function exec(command: string) {
    document.execCommand(command, false)
    ref.current?.focus()
    onChange(ref.current?.innerHTML || "")
  }

  return (
    <div className="rounded-2xl border border-slate-300 overflow-hidden focus-within:border-amber-500 transition">
      <div className="flex items-center gap-1 bg-slate-50 border-b border-slate-200 px-2 py-1.5">
        <button type="button" title="Қалың" onMouseDown={e => e.preventDefault()} onClick={() => exec("bold")} className="w-8 h-8 rounded hover:bg-slate-200 font-bold text-sm transition">B</button>
        <button type="button" title="Курсив" onMouseDown={e => e.preventDefault()} onClick={() => exec("italic")} className="w-8 h-8 rounded hover:bg-slate-200 italic text-sm transition">I</button>
        <button type="button" title="Асты сызылған" onMouseDown={e => e.preventDefault()} onClick={() => exec("underline")} className="w-8 h-8 rounded hover:bg-slate-200 underline text-sm transition">U</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || "")}
        data-placeholder={placeholder}
        className="min-h-[240px] px-4 py-3 text-slate-900 outline-none prose max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
      />
    </div>
  )
}