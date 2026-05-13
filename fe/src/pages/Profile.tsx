import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'
import './Profile.css'

export default function Profile() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') || 'info') as 'info' | 'password'

  const setTab = (t: 'info' | 'password') => setSearchParams({ tab: t })

  return (
    <div className="profile-wrapper">
      <Sidebar active="profile" />

      <main className="main-content">
        <header className="main-header">
          <h1>Tài khoản</h1>
        </header>

        <div className="profile-card">
          {/* Avatar + tên */}
          <div className="profile-hero">
            <div className="profile-avatar-xl">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="profile-hero-name">{user?.name}</div>
              <div className="profile-hero-email">{user?.email}</div>
              <span className="badge-active">● Đang hoạt động</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            <button className={`profile-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
              Thông tin cá nhân
            </button>
            <button className={`profile-tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
              Đổi mật khẩu
            </button>
          </div>

          <div className="profile-body">
            {tab === 'info'     && <InfoTab user={user} />}
            {tab === 'password' && <PasswordTab />}
          </div>
        </div>
      </main>
    </div>
  )
}

/* ── INFO TAB ── */
function InfoTab({ user }: { user: ReturnType<typeof useAuth>['user'] }) {
  return (
    <div className="info-tab">
      <Field label="Họ tên"     value={user?.name  || ''} />
      <Field label="Email"      value={user?.email || ''} />
      <Field label="Vai trò"    value="Người dùng" />
      <Field label="Trạng thái" value="Đang hoạt động" green />
    </div>
  )
}

function Field({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="info-field">
      <span className="if-label">{label}</span>
      <span className={`if-value ${green ? 'if-green' : ''}`}>{value}</span>
    </div>
  )
}

/* ── PASSWORD TAB ── */
function PasswordTab() {
  const [form, setForm]   = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuc] = useState('')
  const [loading, setLod] = useState(false)

  const set = (k: keyof typeof form) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setError(''); setSuc('')
  }

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.current)              return setError('Vui lòng nhập mật khẩu hiện tại')
    if (form.next.length < 6)       return setError('Mật khẩu mới tối thiểu 6 ký tự')
    if (form.next !== form.confirm) return setError('Mật khẩu xác nhận không khớp')
    setLod(true)
    try {
      await api.patch('/auth/change-password', { currentPassword: form.current, newPassword: form.next })
      setSuc('Đổi mật khẩu thành công!')
      setForm({ current: '', next: '', confirm: '' })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Có lỗi xảy ra')
    } finally { setLod(false) }
  }

  return (
    <form className="pwd-tab" onSubmit={handle}>
      <PwdField label="Mật khẩu hiện tại"     value={form.current}  onChange={set('current')} />
      <PwdField label="Mật khẩu mới"          value={form.next}     onChange={set('next')} />
      <PwdField label="Xác nhận mật khẩu mới" value={form.confirm}  onChange={set('confirm')} />
      {error   && <div className="msg-error">{error}</div>}
      {success && <div className="msg-success">{success}</div>}
      <button type="submit" className="btn-save" disabled={loading}>
        {loading ? <span className="spinner-sm" /> : 'Lưu mật khẩu'}
      </button>
    </form>
  )
}

function PwdField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false)
  return (
    <div className="pwd-field">
      <label>{label}</label>
      <div className="pwd-input-wrap">
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} placeholder="••••••" />
        <button type="button" onClick={() => setShow(s => !s)}>
          {show
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          }
        </button>
      </div>
    </div>
  )
}
