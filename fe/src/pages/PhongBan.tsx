import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getPhong, createPhong, updatePhong, deletePhong, type Phong } from '../api/phong'
import './Users.css'

export default function PhongBan() {
  const { user: me, logout } = useAuth()
  const navigate = useNavigate()

  const [phongs, setPhongs] = useState<Phong[]>([])
  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [selected, setSelected] = useState<Phong | null>(null)
  const [tenInput, setTenInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try { setPhongs(await getPhong()) } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => { setTenInput(''); setFormError(''); setModal('create') }
  const openEdit = (p: Phong) => { setSelected(p); setTenInput(p.ten); setFormError(''); setModal('edit') }
  const openDelete = (p: Phong) => { setSelected(p); setModal('delete') }
  const closeModal = () => { setModal(null); setSelected(null); setFormError('') }

  const apiErr = (e: unknown) =>
    (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra'

  const handleCreate = async () => {
    if (!tenInput.trim()) return setFormError('Tên phòng ban không được để trống')
    setSubmitting(true)
    try {
      await createPhong(tenInput.trim())
      await fetchData(); closeModal()
    } catch (e) { setFormError(apiErr(e)) } finally { setSubmitting(false) }
  }

  const handleEdit = async () => {
    if (!tenInput.trim()) return setFormError('Tên phòng ban không được để trống')
    setSubmitting(true)
    try {
      await updatePhong(selected!._id, tenInput.trim())
      await fetchData(); closeModal()
    } catch (e) { setFormError(apiErr(e)) } finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await deletePhong(selected!._id)
      await fetchData(); closeModal()
    } catch (e) { setFormError(apiErr(e)) } finally { setSubmitting(false) }
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
          <a href="/users" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Quản lý tài khoản
          </a>
          <a href="/phong-ban" className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Quản lý phòng ban
          </a>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{me?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{me?.name}</div>
              <div className="user-role">Quản trị viên</div>
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
          <h1>Quản lý phòng ban</h1>
          <button className="btn-primary" onClick={openCreate}>+ Thêm phòng ban</button>
        </header>

        <div className="users-toolbar">
          <div className="users-stats">
            <span>Tổng: <b>{phongs.length}</b> phòng ban</span>
          </div>
        </div>

        <div className="table-card">
          {loading ? (
            <div className="table-loading">Đang tải...</div>
          ) : phongs.length === 0 ? (
            <div className="table-empty">Chưa có phòng ban nào</div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên phòng ban</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {phongs.map((p, i) => (
                  <tr key={p._id}>
                    <td className="td-index">{i + 1}</td>
                    <td>
                      <span className="badge-phong">{p.ten}</span>
                    </td>
                    <td className="td-date">{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="td-actions">
                        <button className="action-btn edit" onClick={() => openEdit(p)} title="Chỉnh sửa">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="action-btn delete" onClick={() => openDelete(p)} title="Xóa">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {modal === 'create' && (
        <Modal title="Thêm phòng ban" onClose={closeModal} onConfirm={handleCreate} confirmText="Tạo phòng ban" submitting={submitting}>
          <div className="modal-field">
            <label>Tên phòng ban *</label>
            <input
              value={tenInput}
              onChange={e => setTenInput(e.target.value)}
              placeholder="Ví dụ: Phòng Dịch vụ Tổng hợp..."
              autoComplete="off"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          {formError && <div className="modal-error">{formError}</div>}
        </Modal>
      )}

      {modal === 'edit' && (
        <Modal title="Chỉnh sửa phòng ban" onClose={closeModal} onConfirm={handleEdit} confirmText="Lưu thay đổi" submitting={submitting}>
          <div className="modal-field">
            <label>Tên phòng ban *</label>
            <input
              value={tenInput}
              onChange={e => setTenInput(e.target.value)}
              placeholder="Tên phòng ban"
              autoComplete="off"
              onKeyDown={e => e.key === 'Enter' && handleEdit()}
            />
          </div>
          {formError && <div className="modal-error">{formError}</div>}
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Xóa phòng ban" onClose={closeModal} onConfirm={handleDelete} confirmText="Xóa" submitting={submitting} confirmColor="#dc2626">
          <p className="modal-desc">
            Bạn có chắc muốn xóa phòng ban <b>{selected?.ten}</b>?
            <br />
            Hành động này không thể hoàn tác. Các tài khoản và hợp đồng thuộc phòng này sẽ không bị ảnh hưởng.
          </p>
          {formError && <div className="modal-error">{formError}</div>}
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
