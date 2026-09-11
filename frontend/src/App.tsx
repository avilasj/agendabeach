import { useState } from 'react'
import AdminPage from './AdminPage'
import BookingPage from './BookingPage'
import CancelBookingPage from './CancelBookingPage'
import MyReservationsPage from './MyReservationsPage'
import { AuthPage } from './components'
import { clearStoredSession, getStoredSession, storeSession } from './session'
import type { SessionUser } from './session'

function App() {
  const [user, setUser] = useState<SessionUser | null>(() => getStoredSession())
  const [currentPage, setCurrentPage] = useState('booking')

  function handleLogin(loggedUser: SessionUser) {
    storeSession(loggedUser)
    setUser(loggedUser)
    setCurrentPage('booking')
  }

  function handleLogout() {
    clearStoredSession()
    setUser(null)
    setCurrentPage('booking')
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />
  }

  // A rota /admin também é renderizada para clientes, mas a própria AdminPage
  // mostra a tela de acesso restrito — e o backend recusa as ações com 403.
  if (currentPage === 'admin') {
    return <AdminPage user={user} onNavigate={setCurrentPage} onLogout={handleLogout} />
  }

  if (currentPage === 'cancel') {
    return <CancelBookingPage user={user} onNavigate={setCurrentPage} onLogout={handleLogout} />
  }

  if (currentPage === 'reservations') {
    return <MyReservationsPage user={user} onNavigate={setCurrentPage} onLogout={handleLogout} />
  }

  return <BookingPage user={user} onNavigate={setCurrentPage} onLogout={handleLogout} />
}

export default App
