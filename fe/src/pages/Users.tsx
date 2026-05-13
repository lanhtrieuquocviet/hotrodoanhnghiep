import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import './Users.css'

interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'user'
  phong?: string | null
  isActive: boolean
  createdAt: string
}

const PHONG_OPTIONS = [
  'Phòng Dịch vụ Tổng hợp, Đào tạo và Bồi dưỡng',
  'Phòng Dịch vụ Khoa học Công nghệ',
]

const EMPTY_FORM = { name: '', email: '', password: '', role: 'user' as 'admin' | 'user', phong: '' }

export default function Users() {
  const { user: me, logout } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 8

  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | 'reset' | null>(null)
  const [selected, setSelected] = useState<User | null>(null)
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM)
  const [resetPwd, setResetPwd] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchUsers = async (p = page, s = search) => {
    setLoading(true)
    try {
      const { data } = await api.get('/users', { params: { page: p, limit: LIMIT, search: s } })
      setUsers(data.users)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers(page, search) }, [page])

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
    fetchUsers(1, val)
  }

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setModal('create') }
  const openEdit = (u: User) => { setSelected(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, phong: u.phong || '' }); setFormError(''); setModal('edit') }
  const openDelete = (u: User) => { setSelected(u); setModal('delete') }
  const openReset = (u: User) => { setSelected(u); setResetPwd(''); setFormError(''); setModal('reset') }
  const closeModal = () => { setModal(null); setSelected(null); setFormError('') }

  const apiErr = (e: unknown) =>
    (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra'

  const handleCreate = async () => {
    if (!form.name.trim()) return setFormError('Họ tên không được để trống')
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setFormError('Email không hợp lệ')
    if (!form.password || form.password.length < 6) return setFormError('Mật khẩu tối thiểu 6 ký tự')
    setSubmitting(true)
    try {
      await api.post('/users', { ...form, phong: form.phong || null })
      setPage(1); await fetchUsers(1, search); closeModal()
    } catch (e) { setFormError(apiErr(e)) } finally { setSubmitting(false) }
  }

  const handleEdit = async () => {
    if (!form.name.trim()) return setFormError('Họ tên không được để trống')
    setSubmitting(true)
    try {
      await api.put(`/users/${selected!._id}`, { name: form.name, role: form.role, isActive: selected!.isActive, phong: form.phong || null })
      await fetchUsers(page, search); closeModal()
    } catch (e) { setFormError(apiErr(e)) } finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await api.delete(`/users/${selected!._id}`)
      const newPage = users.length === 1 && page > 1 ? page - 1 : page
      setPage(newPage); await fetchUsers(newPage, search); closeModal()
    } finally { setSubmitting(false) }
  }

  const handleReset = async () => {
    if (!resetPwd || resetPwd.length < 6) return setFormError('Mật khẩu tối thiểu 6 ký tự')
    setSubmitting(true)
    try {
      await api.patch(`/users/${selected!._id}/reset-password`, { password: resetPwd })
      closeModal()
    } catch (e) { setFormError(apiErr(e)) } finally { setSubmitting(false) }
  }

  const handleToggleActive = async (u: User) => {
    await api.put(`/users/${u._id}`, { name: u.name, role: u.role, isActive: !u.isActive })
    await fetchUsers(page, search)
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
            <rect x="4" y="4" width="26" height="26" rx="3" fill="#fff" opacity="0.9" />
            <rect x="18" y="18" width="26" height="26" rx="3" fill="#fff" opacity="0.75" />
            <rect x="32" y="4" width="26" height="26" rx="3" fill="#fff" opacity="0.6" />
            <rect x="4" y="32" width="26" height="26" rx="3" fill="#fff" opacity="0.6" />
          </svg>
          <span>ESSC</span>
        </div>
        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            Tổng quan
          </a>
          <a href="/hop-dong" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Quản lý Hợp đồng
          </a>
          <a href="/users" className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Quản lý tài khoản
          </a>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{me?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{me?.name}</div>
              <div className="user-role">{me?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <h1>Quản lý tài khoản</h1>
          <button className="btn-primary" onClick={openCreate}>+ Thêm tài khoản</button>
        </header>

        {/* Search + stats */}
        <div className="users-toolbar">
          <div className="search-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="users-stats">
            <span>Tổng: <b>{total}</b></span>
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          {loading ? (
            <div className="table-loading">Đang tải...</div>
          ) : users.length === 0 ? (
            <div className="table-empty">Không tìm thấy tài khoản nào</div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Phòng ban</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id}>
                    <td className="td-index">{(page - 1) * LIMIT + i + 1}</td>
                    <td>
                      <div className="td-user">
                        <div className="td-avatar">{u.name[0]?.toUpperCase()}</div>
                        <span>{u.name}</span>
                        {u._id === me?._id && <span className="badge-me">Bạn</span>}
                      </div>
                    </td>
                    <td className="td-email">{u.email}</td>
                    <td>
                      {u.phong
                        ? <span className="badge-phong">{u.phong}</span>
                        : <span className="td-no-phong">—</span>}
                    </td>
                    <td>
                      <span className={`badge-role ${u.role}`}>
                        {u.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`badge-status ${u.isActive ? 'active' : 'inactive'}`}
                        onClick={() => u._id !== me?._id && handleToggleActive(u)}
                        title={u._id === me?._id ? 'Không thể khóa chính mình' : (u.isActive ? 'Nhấn để khóa' : 'Nhấn để mở khóa')}
                        style={{ cursor: u._id === me?._id ? 'not-allowed' : 'pointer' }}
                      >
                        {u.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </button>
                    </td>
                    <td className="td-date">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="td-actions">
                        <button className="action-btn edit" onClick={() => openEdit(u)} title="Chỉnh sửa">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="action-btn reset" onClick={() => openReset(u)} title="Đặt lại mật khẩu">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </button>
                        {u._id !== me?._id && (
                          <button className="action-btn delete" onClick={() => openDelete(u)} title="Xóa">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="pg-btn">‹ Trước</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`pg-btn ${p === page ? 'pg-active' : ''}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="pg-btn">Sau ›</button>
            </div>
          )}
        </div>
      </main>

      {/* Modal Create */}
      {modal === 'create' && (
        <Modal title="Thêm tài khoản" onClose={closeModal} onConfirm={handleCreate} confirmText="Tạo tài khoản" submitting={submitting}>
          <FormField label="Họ tên *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Nguyễn Văn A" />
          <FormField label="Email *" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="example@essc.vn" />
          <FormField label="Mật khẩu *" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="Tối thiểu 6 ký tự" type="password" />
          <div className="modal-field">
            <label>Vai trò</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'user' }))}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {form.role === 'user' && (
            <div className="modal-field">
              <label>Phòng ban</label>
              <select value={form.phong} onChange={e => setForm(f => ({ ...f, phong: e.target.value }))}>
                <option value="">— Chọn phòng —</option>
                {PHONG_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}
          {formError && <div className="modal-error">{formError}</div>}
        </Modal>
      )}

      {/* Modal Edit */}
      {modal === 'edit' && (
        <Modal title="Chỉnh sửa tài khoản" onClose={closeModal} onConfirm={handleEdit} confirmText="Lưu thay đổi" submitting={submitting}>
          <FormField label="Họ tên *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Nguyễn Văn A" />
          <div className="modal-field">
            <label>Email</label>
            <input value={form.email} disabled className="input-disabled" />
          </div>
          <div className="modal-field">
            <label>Vai trò</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'admin' | 'user', phong: e.target.value === 'admin' ? '' : f.phong }))}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {form.role === 'user' && (
            <div className="modal-field">
              <label>Phòng ban</label>
              <select value={form.phong} onChange={e => setForm(f => ({ ...f, phong: e.target.value }))}>
                <option value="">— Chọn phòng —</option>
                {PHONG_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}
          {formError && <div className="modal-error">{formError}</div>}
        </Modal>
      )}

      {/* Modal Reset Password */}
      {modal === 'reset' && (
        <Modal title="Đặt lại mật khẩu" onClose={closeModal} onConfirm={handleReset} confirmText="Xác nhận" submitting={submitting} confirmColor="#d97706">
          <p className="modal-desc">Đặt lại mật khẩu cho <b>{selected?.name}</b></p>
          <FormField label="Mật khẩu mới *" value={resetPwd} onChange={setResetPwd} placeholder="Tối thiểu 6 ký tự" type="password" />
          {formError && <div className="modal-error">{formError}</div>}
        </Modal>
      )}

      {/* Modal Delete */}
      {modal === 'delete' && (
        <Modal title="Xóa tài khoản" onClose={closeModal} onConfirm={handleDelete} confirmText="Xóa" submitting={submitting} confirmColor="#dc2626">
          <p className="modal-desc">Bạn có chắc muốn xóa tài khoản <b>{selected?.name}</b>? Hành động này không thể hoàn tác.</p>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, children, onClose, onConfirm, confirmText, submitting, confirmColor = '#1a4f8a' }: {
  title: string; children?: React.ReactNode; onClose: () => void
  onConfirm: () => void; confirmText: string; submitting: boolean; confirmColor?: string
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-confirm" style={{ background: confirmColor }} onClick={onConfirm} disabled={submitting}>
            {submitting ? <span className="spinner-sm" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="modal-field">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
      />
    </div>
  )
}
