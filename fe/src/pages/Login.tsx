import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateFields(email: string, password: string) {
  const errs: { email?: string; password?: string } = {}
  if (!email.trim()) errs.email = 'Email không được để trống'
  else if (!EMAIL_REGEX.test(email)) errs.email = 'Email không đúng định dạng'
  if (!password) errs.password = 'Mật khẩu không được để trống'
  else if (password.length < 6) errs.password = 'Mật khẩu tối thiểu 6 ký tự'
  return errs
}

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({ email: false, password: false })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const fieldErrors = validateFields(form.email, form.password)

  const handleBlur = (field: 'email' | 'password') =>
    setTouched(t => ({ ...t, [field]: true }))

  const handleChange = (field: 'email' | 'password', value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setServerError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (Object.keys(validateFields(form.email, form.password)).length > 0) return
    setServerError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      window.location.href = '/dashboard'
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setServerError(msg || 'Đăng nhập thất bại, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-left-content">
          <EsscLogo />
          <h2 className="left-title">Trung tâm Dịch vụ &amp; Hỗ trợ Doanh nghiệp</h2>
          <p className="left-sub">
            Nền tảng quản lý và hỗ trợ toàn diện, giúp doanh nghiệp vận hành hiệu quả hơn mỗi ngày.
          </p>
          <div className="left-features">
            <FeatureItem icon="✦" text="Quản lý dịch vụ tập trung" />
            <FeatureItem icon="✦" text="Hỗ trợ khách hàng 24/7" />
            <FeatureItem icon="✦" text="Báo cáo & phân tích thời gian thực" />
          </div>
        </div>
        <div className="left-decoration" />
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h1>Đăng nhập</h1>
            <p>Vui lòng nhập thông tin tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className={`input-wrapper ${touched.email && fieldErrors.email ? 'input-error' : ''}`}>
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="text"
                  placeholder="example@essc.vn"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  autoComplete="email"
                />
              </div>
              {touched.email && fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Mật khẩu
                <a href="#" className="forgot-link">Quên mật khẩu?</a>
              </label>
              <div className={`input-wrapper ${touched.password && fieldErrors.password ? 'input-error' : ''}`}>
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {touched.password && fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span className="checkmark" />
                Ghi nhớ đăng nhập
              </label>
            </div>

            {serverError && <div className="login-error">{serverError}</div>}

            <button type="submit" className={`btn-login ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Đăng nhập'}
            </button>
          </form>

          <p className="login-footer">
            © 2025 ESSC · Enterprise Support and Service Center
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="feature-item">
      <span className="feature-icon">{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function EsscLogo() {
  return (
    <div className="essc-logo">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="4" y="4" width="26" height="26" rx="3" fill="#1a4f8a" opacity="0.9" />
        <rect x="18" y="18" width="26" height="26" rx="3" fill="#2563a8" opacity="0.85" />
        <rect x="32" y="4" width="26" height="26" rx="3" fill="#1a4f8a" opacity="0.7" />
        <rect x="4" y="32" width="26" height="26" rx="3" fill="#1a4f8a" opacity="0.7" />
      </svg>
      <div className="essc-text">
        <span className="essc-title">ESSC</span>
        <span className="essc-subtitle">ENTERPRISE SUPPORT AND SERVICE CENTER</span>
      </div>
    </div>
  )
}
