import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { PHONG_OPTIONS, KHU_OPTIONS } from '../api/hopDong'
import './HopDong.css'

/* ── Types ── */
interface NhanVien { _id: string; name: string }
interface HopDong {
  _id: string
  soHopDong?: string
  tenDoanhNghiep: string
  phong: string
  nguoiPhuTrach?: NhanVien | null
  sdtVaNguoiLienHe?: string
  khuCongNghiep?: string
  linhVuc?: string
  trangThaiKy: string
  ngayKy?: string
  giaTriHopDong: number
  trangThai: string
  xacNhan: string
  ghiChu?: string
}

const TRANG_THAI_KY   = ['Đã ký kết', 'Đang thương thảo', 'Chưa ký']
const TRANG_THAI_HD   = ['Đang thực hiện', 'Đã hoàn thành', 'Hủy']
const XAC_NHAN_OPT    = ['', 'Hoàn thành', 'Chưa hoàn thành']

const EMPTY_FORM = {
  soHopDong: '', tenDoanhNghiep: '', phong: '', nguoiPhuTrach: '',
  sdtVaNguoiLienHe: '', khuCongNghiep: '', linhVuc: '',
  trangThaiKy: 'Chưa ký', ngayKy: '', giaTriHopDong: '',
  trangThai: 'Đang thực hiện', xacNhan: '', ghiChu: '',
}

const formatVND = (v: number) => v > 0 ? v.toLocaleString('vi-VN') + ' đ' : '—'
const formatNgay = (d?: string) => {
  if (!d) return '—'
  const dt = new Date(d)
  return `Tháng ${dt.getMonth() + 1}/${dt.getFullYear()}`
}

/* ── Grouped data helper ── */
interface Group { nhanVien: string; nhanVienId: string; items: HopDong[]; tongGiaTri: number }
function groupByNV(list: HopDong[]): Group[] {
  const map = new Map<string, Group>()
  list.forEach((hd) => {
    const key = hd.nguoiPhuTrach?._id ?? '__none__'
    const name = hd.nguoiPhuTrach?.name ?? 'Chưa phân công'
    if (!map.has(key)) map.set(key, { nhanVien: name, nhanVienId: key, items: [], tongGiaTri: 0 })
    const g = map.get(key)!
    g.items.push(hd)
    g.tongGiaTri += hd.giaTriHopDong || 0
  })
  return Array.from(map.values())
}

/* ── Badge helpers ── */
function BadgeKy({ v }: { v: string }) {
  const cls = v === 'Đã ký kết' ? 'ky-done' : v === 'Đang thương thảo' ? 'ky-process' : 'ky-none'
  return <span className={`hd-badge ${cls}`}>{v || '—'}</span>
}
function BadgeTT({ v }: { v: string }) {
  const cls = v === 'Đã hoàn thành' ? 'tt-done' : v === 'Hủy' ? 'tt-cancel' : 'tt-process'
  return <span className={`hd-badge ${cls}`}>{v}</span>
}
function BadgeXN({ v }: { v: string }) {
  if (!v) return <span className="hd-badge xn-none">—</span>
  return <span className={`hd-badge ${v === 'Hoàn thành' ? 'xn-done' : 'xn-pending'}`}>{v}</span>
}

/* ══════════════ MAIN PAGE ══════════════ */
export default function HopDongPage() {
  const { user: me, logout } = useAuth()
  const navigate = useNavigate()

  const [list, setList] = useState<HopDong[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [filterKhu, setFilterKhu] = useState('')
  const [filterTrangThaiKy, setFilterTrangThaiKy] = useState('')
  const [filterTrangThai, setFilterTrangThai] = useState('')
  const [filterXacNhan, setFilterXacNhan] = useState('')
  const [filterPhong, setFilterPhong] = useState('')

  const [nhanViens, setNhanViens] = useState<NhanVien[]>([])
  const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [selected, setSelected] = useState<HopDong | null>(null)
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  /* fetch contracts */
  const fetchData = useCallback(async (s = search) => {
    setLoading(true)
    try {
      const { data } = await api.get('/hop-dong', { params: { search: s } })
      setList(data.hopDongs)
    } finally { setLoading(false) }
  }, [search])

  const filtered = list.filter(hd => {
    if (filterKhu && hd.khuCongNghiep !== filterKhu) return false
    if (filterTrangThaiKy && hd.trangThaiKy !== filterTrangThaiKy) return false
    if (filterTrangThai && hd.trangThai !== filterTrangThai) return false
    if (filterXacNhan && hd.xacNhan !== filterXacNhan) return false
    if (filterPhong && hd.phong !== filterPhong) return false
    return true
  })

  const hasFilter = !!(filterKhu || filterTrangThaiKy || filterTrangThai || filterXacNhan || filterPhong)

  const clearFilters = () => {
    setFilterKhu(''); setFilterTrangThaiKy(''); setFilterTrangThai('')
    setFilterXacNhan(''); setFilterPhong('')
  }

  useEffect(() => { fetchData('') }, [])

  /* fetch nhan vien cho dropdown khi phong thay đổi */
  useEffect(() => {
    const phong = form.phong || me?.phong || ''
    if (!phong) { setNhanViens([]); return }
    api.get('/hop-dong/nhan-vien', { params: { phong } }).then(r => setNhanViens(r.data))
  }, [form.phong, me?.phong])

  const handleSearch = (v: string) => {
    setSearch(v)
    fetchData(v)
  }

  /* modal helpers */
  const openCreate = () => {
    setForm({ ...EMPTY_FORM, phong: me?.phong || '' })
    setFormError(''); setModal('create')
  }
  const openEdit = (hd: HopDong) => {
    setSelected(hd)
    setForm({
      soHopDong: hd.soHopDong || '',
      tenDoanhNghiep: hd.tenDoanhNghiep,
      phong: hd.phong,
      nguoiPhuTrach: hd.nguoiPhuTrach?._id || '',
      sdtVaNguoiLienHe: hd.sdtVaNguoiLienHe || '',
      khuCongNghiep: hd.khuCongNghiep || '',
      linhVuc: hd.linhVuc || '',
      trangThaiKy: hd.trangThaiKy || 'Chưa ký',
      ngayKy: hd.ngayKy ? hd.ngayKy.slice(0, 7) : '',
      giaTriHopDong: hd.giaTriHopDong ? String(hd.giaTriHopDong) : '',
      trangThai: hd.trangThai || 'Đang thực hiện',
      xacNhan: hd.xacNhan || '',
      ghiChu: hd.ghiChu || '',
    })
    setFormError(''); setModal('edit')
  }
  const openDelete = (hd: HopDong) => { setSelected(hd); setModal('delete') }
  const closeModal = () => { setModal(null); setSelected(null); setFormError('') }

  const apiErr = (e: unknown) =>
    (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra'

  const buildPayload = () => ({
    ...form,
    nguoiPhuTrach: form.nguoiPhuTrach || null,
    giaTriHopDong: Number(form.giaTriHopDong) || 0,
    ngayKy: form.ngayKy ? new Date(form.ngayKy + '-01').toISOString() : null,
    khuCongNghiep: form.khuCongNghiep || undefined,
  })

  const handleCreate = async () => {
    if (!form.tenDoanhNghiep.trim()) return setFormError('Tên doanh nghiệp không được để trống')
    if (!form.phong) return setFormError('Vui lòng chọn phòng ban')
    setSubmitting(true)
    try {
      await api.post('/hop-dong', buildPayload())
      await fetchData(search); closeModal()
    } catch (e) { setFormError(apiErr(e)) } finally { setSubmitting(false) }
  }

  const handleEdit = async () => {
    if (!form.tenDoanhNghiep.trim()) return setFormError('Tên doanh nghiệp không được để trống')
    setSubmitting(true)
    try {
      await api.put(`/hop-dong/${selected!._id}`, buildPayload())
      await fetchData(search); closeModal()
    } catch (e) { setFormError(apiErr(e)) } finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await api.delete(`/hop-dong/${selected!._id}`)
      await fetchData(search); closeModal()
    } finally { setSubmitting(false) }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  /* ── RENDER ── */
  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
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
          <a href={me?.role === 'admin' ? '/dashboard' : '/home'} className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            Tổng quan
          </a>
          <a href="/hop-dong" className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Quản lý Hợp đồng
          </a>
          {me?.role === 'admin' && (
            <a href="/users" className="nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Quản lý tài khoản
            </a>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{me?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{me?.name}</div>
              <div className="user-role">{me?.phong ? me.phong.replace('Phòng Dịch vụ ', '') : (me?.role === 'admin' ? 'Quản trị viên' : 'Người dùng')}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="main-header">
          <div>
            <h1>Quản lý Hợp đồng</h1>
            {me?.phong && <div className="hd-phong-label">{me.phong}</div>}
          </div>
          <button className="btn-primary" onClick={openCreate}>+ Thêm hợp đồng</button>
        </header>

        {/* Search + Filters */}
        <div className="users-toolbar">
          <div className="search-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Tìm theo tên doanh nghiệp..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <div className="users-stats">
            <span>
              {hasFilter
                ? <><b>{filtered.length}</b> / {list.length} hợp đồng</>
                : <>Tổng: <b>{list.length}</b> hợp đồng</>}
            </span>
          </div>
        </div>

        {/* Filter row */}
        <div className="hd-filter-row">
          {me?.role === 'admin' && (
            <select className={`hd-filter-select${filterPhong ? ' active' : ''}`} value={filterPhong} onChange={e => setFilterPhong(e.target.value)}>
              <option value="">Tất cả phòng</option>
              {PHONG_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          <select className={`hd-filter-select${filterKhu ? ' active' : ''}`} value={filterKhu} onChange={e => setFilterKhu(e.target.value)}>
            <option value="">Tất cả khu CN</option>
            {KHU_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <select className={`hd-filter-select${filterTrangThaiKy ? ' active' : ''}`} value={filterTrangThaiKy} onChange={e => setFilterTrangThaiKy(e.target.value)}>
            <option value="">Tất cả TT ký</option>
            {TRANG_THAI_KY.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className={`hd-filter-select${filterTrangThai ? ' active' : ''}`} value={filterTrangThai} onChange={e => setFilterTrangThai(e.target.value)}>
            <option value="">Tất cả tình trạng</option>
            {TRANG_THAI_HD.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className={`hd-filter-select${filterXacNhan ? ' active' : ''}`} value={filterXacNhan} onChange={e => setFilterXacNhan(e.target.value)}>
            <option value="">Tất cả xác nhận</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Chưa hoàn thành">Chưa hoàn thành</option>
          </select>
          {hasFilter && (
            <button className="hd-filter-clear" onClick={clearFilters}>✕ Xóa bộ lọc</button>
          )}
        </div>

        {/* Table */}
        <div className="hd-table-card">
          {loading ? (
            <div className="table-loading">Đang tải...</div>
          ) : list.length === 0 ? (
            <div className="table-empty">Chưa có hợp đồng nào. Nhấn "+ Thêm hợp đồng" để bắt đầu.</div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">Không có hợp đồng nào khớp với bộ lọc.</div>
          ) : (
            <div className="hd-table-scroll">
              <table className="hd-table">
                <thead>
                  <tr>
                    <th className="th-stt">STT</th>
                    <th className="th-dn">Tên Doanh nghiệp</th>
                    <th>SDT / Người LH</th>
                    <th>Khu CN</th>
                    <th>Lĩnh vực</th>
                    <th>Hợp đồng</th>
                    <th>Ngày tháng</th>
                    <th className="th-gt">Giá trị HĐ</th>
                    <th>Tình trạng</th>
                    <th>Xác nhận</th>
                    <th>Ghi chú</th>
                    <th className="th-act">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {groupByNV(filtered).map((g) => (
                    <>
                      {/* Group header */}
                      <tr key={`g-${g.nhanVienId}`} className="hd-group-row">
                        <td colSpan={7}>
                          <span className="hd-group-title">
                            {g.nhanVien === 'Chưa phân công' ? g.nhanVien : `CV / P.Trưởng phòng: ${g.nhanVien}`}
                          </span>
                        </td>
                        <td colSpan={4} className="hd-group-revenue">
                          {formatVND(g.tongGiaTri)}
                          <span className="hd-group-label">doanh thu</span>
                        </td>
                        <td />
                      </tr>
                      {/* Contract rows */}
                      {g.items.map((hd, idx) => (
                        <tr key={hd._id} className="hd-row">
                          <td className="td-center">{idx + 1}</td>
                          <td className="td-dn">{hd.tenDoanhNghiep}</td>
                          <td className="td-gray">{hd.sdtVaNguoiLienHe || '—'}</td>
                          <td className="td-gray">{hd.khuCongNghiep || '—'}</td>
                          <td>{hd.linhVuc || '—'}</td>
                          <td><BadgeKy v={hd.trangThaiKy} /></td>
                          <td className="td-gray">{formatNgay(hd.ngayKy)}</td>
                          <td className="td-money">{formatVND(hd.giaTriHopDong)}</td>
                          <td><BadgeTT v={hd.trangThai} /></td>
                          <td><BadgeXN v={hd.xacNhan} /></td>
                          <td className="td-gray td-note">{hd.ghiChu || '—'}</td>
                          <td>
                            <div className="td-actions">
                              <button className="action-btn edit" onClick={() => openEdit(hd)} title="Sửa">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                              <button className="action-btn delete" onClick={() => openDelete(hd)} title="Xóa">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                  <path d="M10 11v6M14 11v6"/>
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Create / Edit */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'create' ? 'Thêm hợp đồng' : 'Chỉnh sửa hợp đồng'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body modal-grid">
              {/* Cột trái */}
              <div className="modal-col">
                <MField label="Tên Doanh nghiệp *">
                  <input value={form.tenDoanhNghiep} onChange={e => setForm(f => ({ ...f, tenDoanhNghiep: e.target.value }))} placeholder="Công ty TNHH..." />
                </MField>
                <MField label="Số hợp đồng">
                  <input value={form.soHopDong} onChange={e => setForm(f => ({ ...f, soHopDong: e.target.value }))} placeholder="HD-2026-001" />
                </MField>
                {me?.role === 'admin' && (
                  <MField label="Phòng ban *">
                    <select value={form.phong} onChange={e => setForm(f => ({ ...f, phong: e.target.value, nguoiPhuTrach: '' }))}>
                      <option value="">— Chọn phòng —</option>
                      {PHONG_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </MField>
                )}
                <MField label="Người phụ trách">
                  <select value={form.nguoiPhuTrach} onChange={e => setForm(f => ({ ...f, nguoiPhuTrach: e.target.value }))}>
                    <option value="">— Chọn nhân viên —</option>
                    {nhanViens.map(nv => <option key={nv._id} value={nv._id}>{nv.name}</option>)}
                  </select>
                </MField>
                <MField label="SDT và người liên hệ">
                  <input value={form.sdtVaNguoiLienHe} onChange={e => setForm(f => ({ ...f, sdtVaNguoiLienHe: e.target.value }))} placeholder="0912345678 – Nguyễn Văn A" />
                </MField>
                <MField label="Khu công nghiệp">
                  <select value={form.khuCongNghiep} onChange={e => setForm(f => ({ ...f, khuCongNghiep: e.target.value }))}>
                    <option value="">— Chọn khu CN —</option>
                    {KHU_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </MField>
              </div>
              {/* Cột phải */}
              <div className="modal-col">
                <MField label="Lĩnh vực thực hiện">
                  <input value={form.linhVuc} onChange={e => setForm(f => ({ ...f, linhVuc: e.target.value }))} placeholder="An toàn vệ sinh lao động..." />
                </MField>
                <MField label="Tình trạng ký kết">
                  <select value={form.trangThaiKy} onChange={e => setForm(f => ({ ...f, trangThaiKy: e.target.value }))}>
                    {TRANG_THAI_KY.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </MField>
                <MField label="Ngày tháng">
                  <input type="month" value={form.ngayKy} onChange={e => setForm(f => ({ ...f, ngayKy: e.target.value }))} />
                </MField>
                <MField label="Giá trị hợp đồng (đ)">
                  <input type="number" value={form.giaTriHopDong} onChange={e => setForm(f => ({ ...f, giaTriHopDong: e.target.value }))} placeholder="0" min="0" />
                </MField>
                <MField label="Tình trạng thực hiện">
                  <select value={form.trangThai} onChange={e => setForm(f => ({ ...f, trangThai: e.target.value }))}>
                    {TRANG_THAI_HD.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </MField>
                <MField label="Xác nhận">
                  <select value={form.xacNhan} onChange={e => setForm(f => ({ ...f, xacNhan: e.target.value }))}>
                    {XAC_NHAN_OPT.map(v => <option key={v} value={v}>{v || '— Chưa xác nhận —'}</option>)}
                  </select>
                </MField>
                <MField label="Ghi chú">
                  <textarea value={form.ghiChu} onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))} rows={2} placeholder="Ghi chú thêm..." />
                </MField>
              </div>
            </div>
            {formError && <div className="modal-error" style={{ margin: '0 24px 12px' }}>{formError}</div>}
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Hủy</button>
              <button className="btn-confirm" onClick={modal === 'create' ? handleCreate : handleEdit} disabled={submitting}>
                {submitting ? <span className="spinner-sm" /> : (modal === 'create' ? 'Tạo hợp đồng' : 'Lưu thay đổi')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {modal === 'delete' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xóa hợp đồng</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">Bạn có chắc muốn xóa hợp đồng của <b>{selected?.tenDoanhNghiep}</b>? Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Hủy</button>
              <button className="btn-confirm" style={{ background: '#dc2626' }} onClick={handleDelete} disabled={submitting}>
                {submitting ? <span className="spinner-sm" /> : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="modal-field">
      <label>{label}</label>
      {children}
    </div>
  )
}
