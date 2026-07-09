'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Toast from '@/components/Toast'
import { supabase } from '@/lib/supabase'
import { ARTICLE_CATEGORIES } from '@/lib/categories'

const KAZAKHSTAN_REGIONS = [
  'Алматы облысы',
  'Абай облысы',
  'Ақмола облысы',
  'Ақтөбе облысы',
  'Атырау облысы',
  'Батыс Қазақстан облысы',
  'Жамбыл облысы',
  'Қарағанды облысы',
  'Қостанай облысы',
  'Қызылорда облысы',
  'Маңғыстау облысы',
  'Павлодар облысы',
  'Солтүстік Қазақстан облысы',
  'Түркістан облысы',
  'Шығыс Қазақстан облысы',
  'Астана',
  'Алматы',
  'Жетісу облысы',
  'Ұлытау облысы',
]

const STATUS_LABELS: Record<string, string> = {
  CHECKING: 'Тексерілуде',
  APPROVED: 'Жарияланды',
  DECLINED: 'Қабылданбады',
}

const STATUS_STYLES: Record<string, string> = {
  CHECKING: 'status-checking',
  APPROVED: 'status-approved',
  DECLINED: 'status-declined',
}

export default function ProfilePage() {
  const router = useRouter()
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

  // toasts
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState('info' as 'success' | 'error' | 'info')

  // password change
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
    const { data: arts } = await supabase
      .from('articles')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
    setArticles(arts || [])

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

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <p className="text-center text-slate-500 py-40">Жүктелуде...</p>
    </div>
  )

  const published = articles.filter(a => a.status === 'APPROVED')
  const pending = articles.filter(a => a.status === 'CHECKING')

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
          <div className="bg-slate-900 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                {!editMode ? (
                  <div>
                    <h1 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h1>
                    <p className="text-slate-400">{user?.username ? `@${user.username}` : 'Пайдаланушы аты жоқ'}</p>
                    <p className="text-slate-400">{user?.email}</p>
                    {user?.region && <p className="text-slate-400">Аймақ: {user.region}</p>}
                    {user?.dateOfBirth && <p className="text-slate-400">Туған күн: {new Date(user.dateOfBirth).toLocaleDateString('kk-KZ')}</p>}
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm text-slate-700 mb-1">Тегі</label>
                        <input value={formLastName} onChange={e => setFormLastName(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" placeholder="Тегі" />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-700 mb-1">Аты</label>
                        <input value={formFirstName} onChange={e => setFormFirstName(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" placeholder="Аты" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-1">Пайдаланушы аты</label>
                      <input value={formUsername} onChange={e => setFormUsername(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" placeholder="Пайдаланушы аты (міндетті емес)" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-1">Email</label>
                      <input value={formEmail} readOnly disabled className="w-full px-3 py-2 rounded-md text-sm bg-slate-200 border border-slate-300" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm text-slate-700 mb-1">Туған күні</label>
                        <input type="date" value={formDateOfBirth} onChange={e => setFormDateOfBirth(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-700 mb-1">Өңір</label>
                        <select value={formRegion} onChange={e => setFormRegion(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none">
                          <option value="">Өңірді таңдаңыз</option>
                          {KAZAKHSTAN_REGIONS.map(region => (
                            <option key={region} value={region}>{region}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              <div className="ml-auto flex items-center gap-2">
                {!editMode ? (
                  <>
                    <button onClick={() => setEditMode(true)} className="bg-white text-slate-900 px-3 py-1 rounded-lg text-sm font-medium">Profile өзгерту</button>
                    <button onClick={handleLogout} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Шығу</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => {
                      setEditMode(false)
                      setFormFirstName(user.firstName || '')
                      setFormLastName(user.lastName || '')
                      setFormUsername(user.username || '')
                      setFormEmail(user.email || '')
                      setFormDateOfBirth(user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : '')
                      setFormRegion(user.region || '')
                    }} className="bg-slate-700 text-white px-3 py-1 rounded-lg text-sm">Болдырмау</button>
                    <button type="button" onClick={handleSaveProfile} disabled={saving} className="bg-amber-500 text-slate-900 px-3 py-1 rounded-lg text-sm disabled:opacity-50">{saving ? 'Жүктелуде...' : 'Сақтау'}</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Password change */}
          <div className="p-4 border-t border-slate-200">
            {!changingPassword ? (
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-700">Құпиясөзді өзгерту</p>
                <button onClick={() => setChangingPassword(true)} className="ml-auto text-sm bg-white text-slate-900 px-3 py-1 rounded-lg">Өзгерту</button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-2">
                <input type="password" placeholder="Ағымдағы құпиясөз" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" />
                <input type="password" placeholder="Жаңа құпиясөз" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" />
                <input type="password" placeholder="Жаңа құпиясөзді қайта енгізіңіз" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm border border-slate-300 bg-white focus:border-amber-500 outline-none" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setChangingPassword(false)} className="bg-slate-700 text-white px-3 py-1 rounded-lg">Болдырмау</button>
                  <button type="submit" className="bg-amber-500 text-slate-900 px-3 py-1 rounded-lg">Сақтау</button>
                </div>
              </form>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{published.length}</p>
              <p className="text-xs text-slate-500">Жарияланған</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{pending.length}</p>
              <p className="text-xs text-slate-500">Тексерілуде</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-rose-500">{totalLikes}</p>
              <p className="text-xs text-slate-500">Лайктар</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{comments.length}</p>
              <p className="text-xs text-slate-500">Пікірлер</p>
            </div>
          </div>
        </div>

        {/* My Articles */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-slate-900">Менің мақалаларым</h2>
            <Link href="/submit" className="text-sm text-amber-600 hover:text-amber-700 font-medium">+ Жаңа мақала</Link>
          </div>
          {articles.length === 0 ? (
            <p className="text-slate-500 text-sm">Әзірге мақала жоқ.</p>
          ) : (
            <div className="space-y-3">
              {articles.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-500">{ARTICLE_CATEGORIES[a.category as keyof typeof ARTICLE_CATEGORIES] || a.category} · {new Date(a.created_at).toLocaleDateString('kk-KZ')}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[a.status]}`}>{STATUS_LABELS[a.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments archive */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading text-xl font-bold text-slate-900 mb-4">Пікірлер архиві</h2>
          {comments.length === 0 ? (
            <p className="text-slate-500 text-sm">Әзірге пікір жоқ.</p>
          ) : (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-700">{c.content}</p>
                  <p className="text-xs text-slate-500 mt-1">{c.articles?.title} · {new Date(c.created_at).toLocaleDateString('kk-KZ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <Toast open={toastOpen} message={toastMsg} type={toastType} onClose={() => setToastOpen(false)} />
    </div>
  )
}
