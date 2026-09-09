import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import './AppShell.css'

export function AppShell() {
  const { user, signOut } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-shell-header">
        <span>Legal Ops Intake</span>
        <div className="app-shell-account">
          <span>{user?.email}</span>
          <button type="button" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </header>
      <nav className="app-shell-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/new">New request</NavLink>
      </nav>
      <main className="app-shell-main">
        <Outlet />
      </main>
    </div>
  )
}
