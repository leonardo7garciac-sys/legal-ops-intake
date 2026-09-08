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
      <main className="app-shell-main" />
    </div>
  )
}
