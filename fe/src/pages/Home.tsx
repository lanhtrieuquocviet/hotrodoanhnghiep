import Sidebar from '../components/Sidebar'
import CustomerDashboard from '../components/CustomerDashboard'
import './Home.css'

export default function Home() {
  return (
    <div className="home-wrapper">
      <Sidebar active="dashboard" />
      <main className="main-content">
        <header className="main-header">
          <h1>Tổng quan</h1>
          <span className="header-date">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </header>
        <CustomerDashboard />
      </main>
    </div>
  )
}
