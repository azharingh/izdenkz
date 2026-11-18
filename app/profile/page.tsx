'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Toast from '@/components/Toast'
import { ARTICLE_CATEGORIES } from '@/lib/categories'
import { countWords, calculateReadingTime } from '@/lib/readingTime'

const KAZAKHSTAN_REGIONS = [
  'Алматы облысы', 'Абай облысы', 'Ақмола облысы', 'Ақтөбе облысы', 'Атырау облысы',
  'Батыс Қазақстан облысы', 'Жамбыл облысы', 'Қарағанды облысы', 'Қостанай облысы',
  'Қызылорда облысы', 'Маңғыстау облысы', 'Павлодар облысы', 'Солтүстік Қазақстан облысы',
  'Түркістан облысы', 'Шығыс Қазақстан облысы', 'Астана', 'Алматы', 'Жетісу облысы', 'Ұлытау облысы',
]

const STATUS_META: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Драфт', className: 'bg-slate-100 text-slate-600' },
  CHECKING: { label: 'Тексерілуде', className: 'bg-blue-50 text-blue-700' },
  APPROVED: { label: 'Жарияланды', className: 'bg-emerald-50 text-emerald-700' },
  DECLINED: { label: 'Қабылданбады', className: 'bg-rose-50 text-rose-700' },
}

const TABS = [
  { key: 'published', label: 'Жарияланған', color: 'text-emerald-600' },
  { key: 'drafts', label: 'Драфт', color: 'text-slate-700' },
  { key: 'pending', label: 'Тексерілуде', color: 'text-blue-600' },
  { key: 'declined', label: 'Қабылданбаған', color: 'text-rose-600' },
  { key: 'comments', label: 'Пікірлер', color: 'text-amber-600' },
] as const

type TabKey = (typeof TABS)[number]['key']

const INPUT = 'w-full px-3 py-2.5 rounded-lg text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none'

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const asideRef = useRef<HTMLDivElement>(null)

  const [user, setUser] = useState(null as any)
  const [editMode, setEditMode] = useState(false)
  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formUsername, setFormUsername] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formDateOfBirth, setFormDateOfBirth] = useState('')
  const [formRegion, setFormRegion] = useState('')

  const [articles, setArticles] = useState([] as any[])
  const [comments, setComments] = useState([] as any[])
  const [totalLikes, setTotalLikes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('published')

  const [avatarUrlInput, setAvatarUrlInput] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState('info' as 'success' | 'error' | 'info')

  const [changingPassword, setChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('izden_user')
    if (!stored) {
      router.push('/auth')
      return
    }
    const u = JSON.parse(stored)
    setUser(u)
    fillForm(u)
    loadData(u.id)
  }, [])

  function fillForm(u: any) {
    setFormFirstName(u.firstName || '')
    setFormLastName(u.lastName || '')
    setFormUsername(u.username || '')
    setFormEmail(u.email || '')
    const rawDob = u.dateOfBirth ? new Date(u.dateOfBirth) : null
    setFormDateOfBirth(rawDob && !Number.isNaN(rawDob.getTime()) ? rawDob.toISOString().slice(0, 10) : '')
    setFormRegion(u.region || '')
  }

  async function loadData(userId: string) {
    const id = encodeURIComponent(userId)
    const [artsRes, cmtsRes, likesRes] = await Promise.all([
      fetch(`/api/articles/mine?authorId=${id}`).then(r => r.json()).catch(() => ({ articles: [] })),
      fetch(`/api/comments?authorId=${id}`).then(r => r.json()).catch(() => ({ comments: [] })),
      fetch(`/api/likes?authorId=${id}`).then(r => r.json()).catch(() => ({ count: 0 })),
    ])
    setArticles(artsRes?.articles || [])
    setComments(cmtsRes?.comments || [])
    setTotalLikes(likesRes?.count || 0)
    setLoading(false)
  }

  function showToast(type: 'success' | 'error' | 'info', message: string) {
    setToastType(type)
    setToastMsg(message)
    setToastOpen(true)
  }

  function handleLogout() {
    localStorage.removeItem('izden_user')
    router.push('/')
  }

  function startEdit() {
    setEditMode(true)
    if (window.innerWidth < 1024) {
      setTimeout(() => asideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }

  function cancelEdit() {
    setEditMode(false)
    fillForm(user)
  }

  async function handleSaveProfile(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!formFirstName.trim() || !formLastName.trim()) {
      return showToast('error', 'Аты мен тегін толтырыңыз')
    }

    const prev = { ...user }
    const optimistic = {
      ...user,
      firstName: formFirstName,
      lastName: formLastName,
      username: formUsername,
      dateOfBirth: formDateOfBirth || null,
      region: formRegion || null,
      name: `${formFirstName} ${formLastName}`,
    }

    setUser(optimistic)
    localStorage.setItem('izden_user', JSON.stringify(optimistic))
    setSaving(true)

    try {
      const res = await fetch('/api/auth/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          firstName: formFirstName,
          lastName: formLastName,
          username: formUsername,
          dateOfBirth: formDateOfBirth,
          region: formRegion,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setUser(prev)
        localStorage.setItem('izden_user', JSON.stringify(prev))
        showToast('error', json.error || 'Профильді сақтау мүмкін болмады.')
        return
      }
      localStorage.setItem('izden_user', JSON.stringify(json.user))
      setUser(json.user)
      setEditMode(false)
      showToast('success', 'Профиль сақталды')
    } catch {
      setUser(prev)
      localStorage.setItem('izden_user', JSON.stringify(prev))
      showToast('error', 'Желі қатесі')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!currentPassword || !newPassword) return showToast('error', 'Барлық өрістерді толтырыңыз')
    if (newPassword.length < 8) return showToast('error', 'Жаңа құпиясөз кемінде 8 таңба болуы керек')
    if (newPassword !== confirmPassword) return showToast('error', 'Жаңа құпиясөздер сәйкес келмейді')

    try {
      const res = await fetch('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, currentPassword, newPassword }),
      })
      const json = await res.json()
      if (!res.ok) return showToast('error', json.error || 'Құпиясөз өзгертілмеді')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setChangingPassword(false)
      showToast('success', 'Құпиясөз өзгертілді')
    } catch {
      showToast('error', 'Желі қатесі')
    }
  }

  async function saveAvatar(payload: { imageBase64?: string; imageUrl?: string }) {
    setUploadingAvatar(true)
    try {
      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...payload }),
      })
      const json = await res.json()
      if (!res.ok) {
        setAvatarPreview('')
        showToast('error', json.error || 'Сурет сақталмады.')
        return
      }
      const updated = { ...user, avatarUrl: json.avatarUrl }
      setUser(updated)
      localStorage.setItem('izden_user', JSON.stringify(updated))
      setAvatarUrlInput('')
      setAvatarPreview('')
      showToast('success', 'Профиль суреті жаңартылды')
    } catch {
      setAvatarPreview('')
      showToast('error', 'Желі қатесі')
    } finally {
      setUploadingAvatar(false)
    }
  }

  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      setAvatarPreview(base64)
      await saveAvatar({ imageBase64: base64 })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="bg-slate-900 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-700" />
            <div className="space-y-3">
              <div className="h-6 w-48 bg-slate-700 rounded" />
              <div className="h-4 w-32 bg-slate-800 rounded" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const published = articles.filter(a => a.status === 'APPROVED')
  const drafts = articles.filter(a => a.status === 'DRAFT')
  const pending = articles.filter(a => a.status === 'CHECKING')
  const declined = articles.filter(a => a.status === 'DECLINED')

  const counts: Record<TabKey, number> = {
    published: published.length,
    drafts: drafts.length,
    pending: pending.length,
    declined: declined.length,
    comments: comments.length,
  }

  const lists: Record<string, any[]> = { published, drafts, pending, declined }

  const totalWords = published.reduce((sum, a) => sum + countWords(a.content), 0)
  const contestCount = articles.filter(a => a.is_contest && a.status !== 'DRAFT').length
  const winnerCount = articles.filter(a => a.is_winner).length

  const activeLabel = TABS.find(t => t.key === activeTab)?.label || ''
  const avatarSrc = avatarPreview || user?.avatarUrl

  function renderArticle(a: any) {
    const meta = STATUS_META[a.status] || STATUS_META.CHECKING
    const isDraft = a.status === 'DRAFT'
    const href = isDraft ? `/submit?edit=${a.id}` : `/articles/${a.id}`
    const words = countWords(a.content)
    const isCoAuthored = user && a.author_id !== user.id

    return (
      <Link
        key={a.id}
        href={href}
        className="group flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-sm transition"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              {ARTICLE_CATEGORIES[a.category as keyof typeof ARTICLE_CATEGORIES] || a.category}
            </span>
            {a.is_contest && (
              <span className="text-xs font-medium text-white bg-slate-900 px-2 py-0.5 rounded">Izden Maqala</span>
            )}
            {a.is_winner && (
              <span className="text-xs font-semibold text-slate-900 bg-amber-400 px-2 py-0.5 rounded">🏆 Жеңімпаз</span>
            )}
            {isCoAuthored && (
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Тең автор</span>
            )}
          </div>
          <p className="font-heading font-bold text-slate-900 group-hover:text-amber-600 transition break-words">
            {a.title || 'Атаусыз драфт'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {words} сөз · {calculateReadingTime(a.content)} мин · {new Date(a.created_at).toLocaleDateString('kk-KZ')}
          </p>
          {a.status === 'DECLINED' && (
            <p className="text-xs text-rose-600 mt-1.5">Түзету нұсқаулығы email арқылы жіберіледі.</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${meta.className}`}>{meta.label}</span>
          <span className="text-sm text-slate-400 group-hover:text-amber-600 transition">
            {isDraft ? 'Өңдеу →' : '→'}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Full-width header band */}
      <section className="bg-slate-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative group shrink-0 mx-auto md:mx-0">
              <div className="w-24 h-24 rounded-full bg-amber-500 overflow-hidden flex items-center justify-center ring-4 ring-slate-800">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-slate-900">{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                aria-label="Профиль суретін өзгерту"
                className="absolute inset-0 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 focus:opacity-100 transition text-white text-xs font-medium flex items-center justify-center"
              >
                {uploadingAvatar ? '...' : 'Өзгерту'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
            </div>

            <div className="flex-1 min-w-0 text-center md:text-left">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white break-words">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-slate-400 mt-1">
                {user?.username ? `@${user.username}` : 'Пайдаланушы аты жоқ'}
                <span className="mx-2 text-slate-600">·</span>
                {user?.email}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                {user?.region && (
                  <span className="text-xs text-slate-300 bg-slate-800 px-3 py-1 rounded-full">📍 {user.region}</span>
                )}
                {winnerCount > 0 && (
                  <span className="text-xs font-semibold text-slate-900 bg-amber-400 px-3 py-1 rounded-full">🏆 Izden Maqala жеңімпазы</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 shrink-0">
              <Link
                href="/submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-5 py-2.5 rounded-lg text-sm font-semibold transition"
              >
                + Жаңа мақала
              </Link>
              <button
                onClick={startEdit}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Профильді өзгерту
              </button>
              <button
                onClick={handleLogout}
                className="border border-slate-700 hover:border-slate-500 text-slate-300 px-4 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Шығу
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stat cards overlapping the band — each one switches the list below */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              aria-pressed={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-left bg-white rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                activeTab === tab.key ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-200'
              }`}
            >
              <p className={`font-heading text-3xl font-bold ${tab.color}`}>{counts[tab.key]}</p>
              <p className="text-xs text-slate-500 mt-1">{tab.label}</p>
            </button>
          ))}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="font-heading text-3xl font-bold text-rose-500">{totalLikes}</p>
            <p className="text-xs text-slate-500 mt-1">Жиналған лайктар</p>
          </div>
        </div>
      </div>

      {/* Body: wide list + side column */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Main list */}
        <main>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-slate-900">
              {activeLabel} <span className="text-slate-400 font-normal">({counts[activeTab]})</span>
            </h2>
            {(activeTab === 'published' || activeTab === 'drafts') && (
              <Link href="/submit" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                + Жаңа мақала
              </Link>
            )}
          </div>

          {activeTab === 'comments' ? (
            comments.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 py-14 text-center">
                <p className="text-slate-500 text-sm">Әзірге пікір жоқ.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {comments.map(c => {
                  const aid = c.article_id || c.articles?.id
                  const inner = (
                    <>
                      <p className="text-sm text-slate-700 break-words">{c.content}</p>
                      <p className="text-xs text-slate-500 mt-1.5">
                        {c.articles?.title ? `${c.articles.title} · ` : ''}
                        {new Date(c.created_at).toLocaleDateString('kk-KZ')}
                      </p>
                    </>
                  )
                  return aid ? (
                    <Link key={c.id} href={`/articles/${aid}`} className="block p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 transition">
                      {inner}
                    </Link>
                  ) : (
                    <div key={c.id} className="p-4 bg-white rounded-xl border border-slate-200">{inner}</div>
                  )
                })}
              </div>
            )
          ) : lists[activeTab].length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 py-14 text-center">
              <p className="text-slate-500 text-sm mb-3">
                {activeTab === 'published' && 'Әзірге жарияланған мақала жоқ.'}
                {activeTab === 'drafts' && 'Драфт жоқ. Жазуды бастап, кейін жалғастыра аласыз.'}
                {activeTab === 'pending' && 'Тексеруде тұрған мақала жоқ.'}
                {activeTab === 'declined' && 'Қабылданбаған мақала жоқ.'}
              </p>
              {(activeTab === 'published' || activeTab === 'drafts') && (
                <Link href="/submit" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Мақала жазу →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">{lists[activeTab].map(renderArticle)}</div>
          )}
        </main>

        {/* Side column */}
        <aside ref={asideRef} className="space-y-4 scroll-mt-24">
          {/* Profile details / edit */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-slate-900">Профиль</h3>
              {!editMode && (
                <button onClick={startEdit} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                  Өзгерту
                </button>
              )}
            </div>

            {!editMode ? (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-400">Аты-жөні</dt>
                  <dd className="text-slate-800">{user?.firstName} {user?.lastName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Пайдаланушы аты</dt>
                  <dd className="text-slate-800">{user?.username ? `@${user.username}` : '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Email</dt>
                  <dd className="text-slate-800 break-all">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Өңір</dt>
                  <dd className="text-slate-800">{user?.region || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Туған күні</dt>
                  <dd className="text-slate-800">
                    {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('kk-KZ') : '—'}
                  </dd>
                </div>
              </dl>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Аты</label>
                    <input value={formFirstName} onChange={e => setFormFirstName(e.target.value)} className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Тегі</label>
                    <input value={formLastName} onChange={e => setFormLastName(e.target.value)} className={INPUT} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Пайдаланушы аты</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                    <input value={formUsername} onChange={e => setFormUsername(e.target.value)} className={`${INPUT} pl-7`} placeholder="username" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Туған күні</label>
                  <input type="date" value={formDateOfBirth} onChange={e => setFormDateOfBirth(e.target.value)} className={INPUT} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Өңір</label>
                  <select value={formRegion} onChange={e => setFormRegion(e.target.value)} className={INPUT}>
                    <option value="">Өңірді таңдаңыз</option>
                    {KAZAKHSTAN_REGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                  <input value={formEmail} readOnly disabled className="w-full px-3 py-2.5 rounded-lg text-sm bg-slate-100 border border-slate-200 text-slate-500" />
                </div>

                <div className="pt-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Профиль суреті</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                      {uploadingAvatar ? 'Жүктелуде...' : 'Сурет жүктеу'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={avatarUrlInput}
                      onChange={e => setAvatarUrlInput(e.target.value)}
                      placeholder="немесе URL сілтеме"
                      className={`${INPUT} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => avatarUrlInput.trim() && saveAvatar({ imageUrl: avatarUrlInput.trim() })}
                      disabled={uploadingAvatar}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      OK
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={cancelEdit} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium transition">
                    Болдырмау
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50">
                    {saving ? 'Сақталуда...' : 'Сақтау'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Password */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-heading font-bold text-slate-900 mb-3">Қауіпсіздік</h3>
            {!changingPassword ? (
              <button onClick={() => setChangingPassword(true)} className="text-sm text-slate-600 hover:text-amber-600 transition font-medium">
                🔒 Құпиясөзді өзгерту
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-2">
                <input type="password" placeholder="Ағымдағы құпиясөз" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={INPUT} />
                <input type="password" placeholder="Жаңа құпиясөз" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={INPUT} />
                <input type="password" placeholder="Жаңа құпиясөзді қайталаңыз" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={INPUT} />
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setChangingPassword(false)} className="flex-1 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm">Болдырмау</button>
                  <button type="submit" className="flex-1 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg text-sm font-semibold">Сақтау</button>
                </div>
              </form>
            )}
          </div>
        </aside>
      </div>

      <Toast open={toastOpen} message={toastMsg} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  )
}