import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Home from './pages/Home'
import Profile from './pages/Profile'
import HopDong from './pages/HopDong'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <>{children}</>
  return <Navigate to={user.role === 'admin' ? '/dashboard' : '/home'} replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/home" replace />
  return <>{children}</>
}

function DefaultRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/dashboard' : '/home'} replace />
}

function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#1a4f8a', fontFamily: 'sans-serif', fontSize: 15 }}>
      Đang tải...
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"     element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/users"     element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="/hop-dong"  element={<PrivateRoute><HopDong /></PrivateRoute>} />
          <Route path="/home"      element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*"          element={<DefaultRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
