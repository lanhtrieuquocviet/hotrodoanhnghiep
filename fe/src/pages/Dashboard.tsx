import { useAuth } from '../context/AuthContext'
import CustomerDashboard from '../components/CustomerDashboard'
import './Dashboard.css'

export default function Dashboard() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

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
          <a href="/dashboard" className="nav-item active">
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
          {user?.role === 'admin' && (
            <>
              <a href="/users" className="nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Quản lý tài khoản
              </a>
              <a href="/phong-ban" className="nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Quản lý phòng ban
              </a>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">
                {user?.role === 'admin' ? 'Quản trị viên'
                  : user?.role === 'truong_phong' ? `TP – ${user.phong?.replace('Phòng Dịch vụ ', '') ?? ''}`
                  : 'Người dùng'}
              </div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <h1>Tổng quan</h1>
          <span className="header-date">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </header>
        <CustomerDashboard />
      </main>
    </div>
  )
}
