import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { RequireAuth } from './components/auth/RequireAuth'
import { LoginScreen } from './components/auth/LoginScreen'
import { AppShell } from './components/auth/AppShell'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<AppShell />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
