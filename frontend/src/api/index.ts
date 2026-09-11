import { ApiError, request } from './http'
import type {
  ApiUser,
  Booking,
  Cancellation,
  Court,
  CourtPayload,
  CreateBookingPayload,
  ProfileType,
} from './types'

export { ApiError }
export type * from './types'

/* ------------------------------------------------------------------ usuários */

export function login(email: string, password: string) {
  return request<ApiUser>('/users/login', { method: 'POST', body: { email, password } })
}

export function register(name: string, email: string, password: string) {
  return request<ApiUser>('/users', { method: 'POST', body: { name, email, password } })
}

export function listUsers() {
  return request<ApiUser[]>('/users')
}

export function listUserBookings(userId: number) {
  return request<Booking[]>(`/users/${userId}/bookings`)
}

/* ------------------------------------------------------------------- quadras */

export function listCourts() {
  return request<Court[]>('/courts')
}

export function createCourt(payload: CourtPayload, userId: number) {
  return request<Court>('/courts', { method: 'POST', body: payload, userId })
}

export function updateCourt(id: number, payload: CourtPayload, userId: number) {
  return request<Court>(`/courts/${id}`, { method: 'PUT', body: payload, userId })
}

export function deleteCourt(id: number, userId: number) {
  return request<void>(`/courts/${id}`, { method: 'DELETE', userId })
}

/* ------------------------------------------------------------------ reservas */

export function listBookings() {
  return request<Booking[]>('/bookings')
}

export function searchBookings(date: string, courtId?: number) {
  const query = new URLSearchParams({ date })
  if (courtId !== undefined) query.set('courtId', String(courtId))
  return request<Booking[]>(`/bookings/search?${query.toString()}`)
}

export function createBooking(payload: CreateBookingPayload) {
  return request<Booking>('/bookings', { method: 'POST', body: payload })
}

export function cancelBooking(id: number) {
  return request<Cancellation>(`/bookings/${id}/cancel`, { method: 'POST' })
}

/* --------------------------------------------------------------------- perfil */

/**
 * O endpoint de login não devolve o perfil do usuário, então descobrimos o papel
 * consultando um endpoint que o próprio backend já protege com `ensureAdmin`:
 * um PUT sem nenhum campo preenchido em /courts/{id} não altera nada (o
 * CourtService ignora valores nulos) e responde 200 para ADMIN e 403 para CLIENT.
 *
 * Sem nenhuma quadra cadastrada não há como sondar; nesse caso devolvemos
 * 'UNKNOWN' e deixamos o backend validar cada ação administrativa.
 */
export async function detectProfile(userId: number): Promise<ProfileType | 'UNKNOWN'> {
  let courts: Court[]
  try {
    courts = await listCourts()
  } catch {
    return 'UNKNOWN'
  }

  const probe = courts[0]
  if (!probe) return 'UNKNOWN'

  try {
    await updateCourt(probe.id, {}, userId)
    return 'ADMIN'
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return 'CLIENT'
    return 'UNKNOWN'
  }
}
