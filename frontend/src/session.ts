import type { ProfileType } from './api/types'

export type SessionUser = {
  id: number
  name: string
  email: string
  /** 'UNKNOWN' quando não foi possível confirmar o perfil no backend. */
  profile: ProfileType | 'UNKNOWN'
}

const STORAGE_KEY = 'agendabeach.session'

export function getStoredSession(): SessionUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as SessionUser
    return typeof parsed?.id === 'number' ? parsed : null
  } catch {
    return null
  }
}

export function storeSession(user: SessionUser) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch {
    /* modo privado / storage bloqueado: a sessão vive só em memória */
  }
}

export function clearStoredSession() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* nada a fazer */
  }
}

export function isAdmin(user: SessionUser | null) {
  return user?.profile === 'ADMIN'
}

/** Perfil não confirmado: liberamos a navegação e deixamos o backend validar cada ação. */
export function canTryAdmin(user: SessionUser | null) {
  return user?.profile === 'ADMIN' || user?.profile === 'UNKNOWN'
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'AB'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
