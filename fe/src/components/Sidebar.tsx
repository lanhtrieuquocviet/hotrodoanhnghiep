import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

type ActiveKey = 'dashboard' | 'hop-dong' | 'profile'

export default function Sidebar({ active }: { active: ActiveKey }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
          <rect x="4"  y="4"  width="26" height="26" rx="3" fill="#fff" opacity="0.9" />
          <rect x="18" y="18" width="26" height="26" rx="3" fill="#fff" opacity="0.75" />
          <rect x="32" y="4"  width="26" height="26" rx="3" fill="#fff" opacity="0.6" />
          <rect x="4"  y="32" width="26" height="26" rx="3" fill="#fff" opacity="0.6" />
        </svg>
        <span>ESSC</span>
      </div>

      <nav className="sidebar-nav">
        <a href="/home" className={`nav-item ${active === 'dashboard' ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          Tổng quan
        </a>
        <a href="/hop-dong" className={`nav-item ${active === 'hop-dong' ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          Quản lý Hợp đồng
        </a>
      </nav>

      <div className="sidebar-footer">
        <a href="/profile" className="user-info user-info-link">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">
              {user?.phong ? user.phong.replace('Phòng Dịch vụ ', '') : 'Người dùng'}
            </div>
          </div>
        </a>
        <button className="btn-logout" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
