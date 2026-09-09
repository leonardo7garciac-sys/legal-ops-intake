import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { RequireAuth } from './components/auth/RequireAuth'
import { LoginScreen } from './components/auth/LoginScreen'
import { AppShell } from './components/auth/AppShell'
import { IntakeForm } from './components/intake/IntakeForm'
import { DashboardScreen } from './components/dashboard/DashboardScreen'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/new" element={<IntakeForm />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
