import { AuthPanel } from '../AuthPanel'
import { AuthShowcase } from '../AuthShowcase'
import type { SessionUser } from '../../session'
import './AuthPage.css'

type AuthPageProps = {
  onLogin: (user: SessionUser) => void
}

export function AuthPage({ onLogin }: AuthPageProps) {
  return (
    <main className="auth-page">
      <AuthShowcase />
      <AuthPanel onLogin={onLogin} />
    </main>
  )
}
