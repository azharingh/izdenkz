'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Toast from '@/components/Toast'
import { supabase } from '@/lib/supabase'
import { ARTICLE_CATEGORIES } from '@/lib/categories'

const KAZAKHSTAN_REGIONS = [
  'Алматы облысы', 'Абай облысы', 'Ақмола облысы', 'Ақтөбе облысы', 'Атырау облысы',
  'Батыс Қазақстан облысы', 'Жамбыл облысы', 'Қарағанды облысы', 'Қостанай облысы',
  'Қызылорда облысы', 'Маңғыстау облысы', 'Павлодар облысы', 'Солтүстік Қазақстан облысы',
  'Түркістан облысы', 'Шығыс Қазақстан облысы', 'Астана', 'Алматы', 'Жетісу облысы', 'Ұлытау облысы',
]

const STATUS_LABELS: Record<string, string> = {
  CHECKING: 'Тексерілуде',
  APPROVED: 'Жарияланды',
  DECLINED: 'Қабылданбады',
  DRAFT: 'Драфт',
}

const STATUS_STYLES: Record<string, string> = {
  CHECKING: 'status-checking',
  APPROVED: 'status-approved',
  DECLINED: 'status-declined',
  DRAFT: 'bg-slate-100 text-slate-500',
}

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
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
  const [activeTab, setActiveTab] = useState<'articles' | 'drafts' | 'comments'>('articles')

  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarUrlInput, setAvatarUrlInput] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showAvatarUrlField, setShowAvatarUrlField] = useState(false)

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
    setFormFirstName(u.firstName || '')
    setFormLastName(u.lastName || '')
    setFormUsername(u.username || '')
    setFormEmail(u.email || '')
    const rawDob = u.dateOfBirth ? new Date(u.dateOfBirth) : null
    setFormDateOfBirth(rawDob && !Number.isNaN(rawDob.getTime()) ? rawDob.toISOString().slice(0, 10) : '')
    setFormRegion(u.region || '')
    loadData(u.id)
  }, [])

  async function loadData(userId: string) {
    const artsRes = await fetch(`/api/articles/mine?authorId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .catch(() => ({ articles: [] }))
    setArticles(artsRes?.articles || [])

    const cmtsRes = await fetch(`/api/comments?authorId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .catch(() => ({ comments: [] }))
    setComments(cmtsRes?.comments || [])

    const likesRes = await fetch(`/api/likes?authorId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .catch(() => ({ count: 0 }))
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

  function cancelEdit() {
    setEditMode(false)
    setShowAvatarUrlField(false)
    setFormFirstName(user.firstName || '')
    setFormLastName(user.lastName || '')
    setFormUsername(user.username || '')
    setFormEmail(user.email || '')
    setFormDateOfBirth(user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : '')
    setFormRegion(user.region || '')
  }

  async function handleSaveProfile(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!formFirstName.trim() || !formLastName.trim()) {
      return showToast('error', 'Тек қана бірінші және соңғы есімді толтырыңыз')
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
      const updated = json.user
      localStorage.setItem('izden_user', JSON.stringify(updated))
      setUser(updated)
      setEditMode(false)
      showToast('success', 'Профиль сақталды')
    } catch (err) {
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
    } catch (err) {
      showToast('error', 'Желі қатесі')
    }
  }

  async function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      setAvatarPreview(base64)
      await saveAvatar({ imageBase64: base64 })
    }
    reader.readAsDataURL(file)
  }

  async function handleAvatarUrlSave() {
    if (!avatarUrlInput.trim()) return
    await saveAvatar({ imageUrl: avatarUrlInput.trim() })
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
        showToast('error', json.error || 'Сурет сақталмады.')
        return
      }
      const updated = { ...user, avatarUrl: json.avatarUrl }
      setUser(updated)
      localStorage.setItem('izden_user', JSON.stringify(updated))
      setAvatarUrlInput('')
      setAvatarPreview('')
      setShowAvatarUrlField(false)
      showToast('success', 'Профиль суреті жаңартылды')
    } catch {
      showToast('error', 'Желі қатесі')
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-24 pt-32 space-y-6">
        <div className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    </div>
  )

  const published = articles.filter(a => a.status === 'APPROVED')
  const pending = articles.filter(a => a.status === 'CHECKING')
  const drafts = articles.filter(a => a.status === 'DRAFT')
  const nonDraftArticles = articles.filter(a => a.status !== 'DRAFT')

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">

        {/* Identity card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="bg-slate-900 px-5 sm:px-8 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Avatar — click to change when editing */}
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl || avatarPreview ? (
                    <img src={avatarPreview || user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-slate-900">{user?.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                {editMode && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 w-20 h-20 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium"
                  >
                    {uploadingAvatar ? '...' : 'Өзгерту'}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <h1 className="text-xl font-bold text-white break-words">{user?.firstName} {user?.lastName}</h1>
                <p className="text-slate-400 text-sm mt-0.5">{user?.username ? `@${user.username}` : 'Пайдаланушы аты жоқ'}</p>
                <p className="text-slate-400 text-sm">{user?.email}</p>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
                {!editMode ? (
                  <>
                    <button onClick={() => setEditMode(true)} className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition">
                      Өзгерту
                    </button>
                    <button onClick={handleLogout} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                      Шығу
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={cancelEdit} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition">
                      Болдырмау
                    </button>
                    <button type="button" onClick={handleSaveProfile} disabled={saving} className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-400 transition disabled:opacity-50">
                      {saving ? 'Сақталуда...' : 'Сақтау'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {editMode && (
              <button
                type="button"
                onClick={() => setShowAvatarUrlField(v => !v)}
                className="text-xs text-slate-400 hover:text-amber-400 transition mt-3 mx-auto sm:mx-0 block"
              >
                {showAvatarUrlField ? 'Файл жүктеу' : 'немесе URL сілтеме қою'}
              </button>
            )}
            {editMode && showAvatarUrlField && (
              <div className="flex gap-2 mt-2 max-w-sm mx-auto sm:mx-0">
                <input
                  type="text"
                  value={avatarUrlInput}
                  onChange={e => setAvatarUrlInput(e.target.value)}
                  placeholder="Сурет URL сілтемесі"
                  className="flex-1 px-3 py-1.5 rounded-md text-sm border border-slate-600 bg-slate-800 text-white placeholder:text-slate-500 focus:border-amber-500 outline-none"
                />
                <button type="button" onClick={handleAvatarUrlSave} disabled={uploadingAvatar} className="bg-amber-500 text-slate-900 px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-50">
                  Сақтау
                </button>
              </div>
            )}
          </div>

          {/* Not editing: quick meta row */}
          {!editMode && (user?.region || user?.dateOfBirth) && (
            <div className="px-5 sm:px-8 py-3 border-b border-slate-100 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
              {user?.region && <span>📍 {user.region}</span>}
              {user?.dateOfBirth && <span>🎂 {new Date(user.dateOfBirth).toLocaleDateString('kk-KZ')}</span>}
            </div>
          )}

          {/* Edit form */}
          {editMode && (
            <form onSubmit={handleSaveProfile} className="px-5 sm:px-8 py-6 space-y-5 border-b border-slate-100">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Аты</label>
                  <input value={formFirstName} onChange={e => setFormFirstName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" placeholder="Аты" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Тегі</label>
                  <input value={formLastName} onChange={e => setFormLastName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" placeholder="Тегі" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Пайдаланушы аты</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                  <input value={formUsername} onChange={e => setFormUsername(e.target.value)} className="w-full pl-7 pr-3 py-2.5 rounded-lg text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" placeholder="username" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Туған күні</label>
                  <input type="date" value={formDateOfBirth} onChange={e => setFormDateOfBirth(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Өңір</label>
                  <select value={formRegion} onChange={e => setFormRegion(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none">
                    <option value="">Өңірді таңдаңыз</option>
                    {KAZAKHSTAN_REGIONS.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <input value={formEmail} readOnly disabled className="w-full px-3 py-2.5 rounded-lg text-sm bg-slate-100 border border-slate-200 text-slate-500" />
              </div>
            </form>
          )}

          {/* Password change */}
          <div className="px-5 sm:px-8 py-4 border-b border-slate-100">
            {!changingPassword ? (
              <button onClick={() => setChangingPassword(true)} className="text-sm text-slate-600 hover:text-amber-600 transition font-medium inline-flex items-center gap-1.5">
                🔒 Құпиясөзді өзгерту
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-2 max-w-sm">
                <input type="password" placeholder="Ағымдағы құпиясөз" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" />
                <input type="password" placeholder="Жаңа құпиясөз" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" />
                <input type="password" placeholder="Жаңа құпиясөзді қайта енгізіңіз" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" />
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setChangingPassword(false)} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm">Болдырмау</button>
                  <button type="submit" className="bg-amber-500 text-slate-900 px-3 py-1.5 rounded-lg text-sm font-medium">Сақтау</button>
                </div>
              </form>
            )}
          </div>

          {/* Stats — pill row */}
          <div className="px-5 sm:px-8 py-5 flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium">
              <span>{published.length}</span><span className="text-amber-600/70 font-normal">жарияланған</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
              <span>{pending.length}</span><span className="text-blue-600/70 font-normal">тексерілуде</span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full text-sm font-medium">
              <span>{totalLikes}</span><span className="text-rose-500/70 font-normal">лайк</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium">
              <span>{comments.length}</span><span className="text-emerald-600/70 font-normal">пікір</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
             onClick={() => setActiveTab('articles')}
             className={`flex-1 px-4 py-3.5 text-sm font-semibold transition relative ${
              activeTab === 'articles' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
              >
                Мақалалар ({nonDraftArticles.length})
                {activeTab === 'articles' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
            </button>
            <button
            onClick={() => setActiveTab('drafts')}
            className={`flex-1 px-4 py-3.5 text-sm font-semibold transition relative ${
              activeTab === 'drafts' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
              >
                Драфт ({drafts.length})
                {activeTab === 'drafts' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
            </button>
            
            <button
            onClick={() => setActiveTab('comments')}
              className={`flex-1 px-4 py-3.5 text-sm font-semibold transition relative ${
                activeTab === 'comments' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Пікірлер ({comments.length})
              {activeTab === 'comments' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {activeTab === 'articles' ? (
              <>
              <div className="flex justify-end mb-3">
                <Link href="/submit" className="text-sm text-amber-600 hover:text-amber-700 font-medium">+ Жаңа мақала</Link>
                </div>
                {nonDraftArticles.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">Әзірге мақала жоқ.</p>
                ) : (
                <div className="space-y-2">
                  {nonDraftArticles.map(a => (
                    <div key={a.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                      <Link href={`/articles/${a.id}`} className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 break-words">{a.title}</p>
                      <p className="text-xs text-slate-500">{ARTICLE_CATEGORIES[a.category as keyof typeof ARTICLE_CATEGORIES] || a.category} · {new Date(a.created_at).toLocaleDateString('kk-KZ')}</p>
                </Link>
                <span className={`text-xs px-2 py-1 rounded-full font-medium self-start sm:self-auto shrink-0 ${STATUS_STYLES[a.status]}`}>{STATUS_LABELS[a.status]}</span>
              </div>
            ))}
          </div>
        )}
        </>
        ) : activeTab === 'drafts' ? (
        <>
        <div className="flex justify-end mb-3">
          <Link href="/submit" className="text-sm text-amber-600 hover:text-amber-700 font-medium">+ Жаңа драфт</Link>
        </div>
        {drafts.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Әзірге драфт жоқ.</p>
        ) : (
        <div className="space-y-2">
          {drafts.map(a => (
            <Link href={`/submit?edit=${a.id}`} key={a.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 break-words">{a.title || 'Атаусыз драфт'}</p>
                <p className="text-xs text-slate-500">{ARTICLE_CATEGORIES[a.category as keyof typeof ARTICLE_CATEGORIES] || a.category} · {new Date(a.created_at).toLocaleDateString('kk-KZ')}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-slate-200 text-slate-600 self-start sm:self-auto shrink-0">
                Өңдеу →
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  ) : (
              comments.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">Әзірге пікір жоқ.</p>
              ) : (
                <div className="space-y-2">
                  {comments.map(c => (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700">{c.content}</p>
                      <p className="text-xs text-slate-500 mt-1">{c.articles?.title} · {new Date(c.created_at).toLocaleDateString('kk-KZ')}</p>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

      </div>

      <Toast open={toastOpen} message={toastMsg} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  )
}