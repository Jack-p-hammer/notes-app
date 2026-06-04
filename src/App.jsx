import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import NotesList from './pages/NotesList'
import NoteEdit from './pages/NoteEdit'

const ROUTES = {
  login: '/login',
  home: '/',
  note: '/note/:id',
  wildcard: '*',
}

function RequireAuth({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="loading">Loading&hellip;</div>
  if (!session) return <Navigate to={ROUTES.login} replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<Login />} />
      <Route
        path={ROUTES.home}
        element={
          <RequireAuth>
            <NotesList />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.note}
        element={
          <RequireAuth>
            <NoteEdit />
          </RequireAuth>
        }
      />
      <Route path={ROUTES.wildcard} element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
