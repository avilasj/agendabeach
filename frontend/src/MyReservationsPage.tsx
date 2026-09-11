import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppHeader, ConfirmDialog, PageHeading, ReservationCard } from './components'
import type { Reservation, ReservationStatus } from './components'
import { getNavigationItems } from './navigation'
import { ApiError, cancelBooking, listCourts, listUserBookings } from './api'
import type { Booking, Court } from './api'
import { getInitials } from './session'
import type { SessionUser } from './session'
import {
  formatCurrency,
  formatDuration,
  formatShortDate,
  formatTime,
  getHoursBetween,
  parseLocalDateTime,
} from './datetime'
import { getRefundPolicy } from './pricing'
import './MyReservationsPage.css'

type Filter = ReservationStatus | 'all'

type MyReservationsPageProps = {
  user: SessionUser
  onNavigate: (value: string) => void
  onLogout: () => void
}

const filters: { label: string; value: Filter }[] = [
  { label: 'Próximas', value: 'upcoming' },
  { label: 'Realizadas', value: 'completed' },
  { label: 'Canceladas', value: 'cancelled' },
  { label: 'Todas', value: 'all' },
]

const emptyMessages: Record<Filter, string> = {
  upcoming: 'Você não tem nenhuma partida agendada. Escolha um dia no calendário para reservar sua quadra.',
  completed: 'Nenhuma partida realizada por aqui ainda.',
  cancelled: 'Nenhuma reserva cancelada. Continue assim!',
  all: 'Você ainda não fez nenhuma reserva.',
}

function getSurface(court: Court | undefined) {
  if (!court) return 'Quadra de areia'
  return court.type === 'COVERED' ? 'Areia oficial · Coberta' : 'Areia oficial · Ao ar livre'
}

function getStatus(booking: Booking, now: Date): ReservationStatus {
  if (booking.status === 'CANCELLED') return 'cancelled'
  if (booking.status === 'COMPLETED') return 'completed'
  return parseLocalDateTime(booking.endTime) < now ? 'completed' : 'upcoming'
}

/** Converte a reserva vinda da API no formato que o ReservationCard já consome. */
function toReservation(booking: Booking, courts: Map<number, Court>, now: Date): Reservation {
  const start = parseLocalDateTime(booking.startTime)
  const end = parseLocalDateTime(booking.endTime)
  const hours = getHoursBetween(start, end)
  const court = courts.get(booking.courtId)

  return {
    id: String(booking.id),
    code: `AB-${String(booking.id).padStart(4, '0')}`,
    court: court?.name ?? `Quadra #${booking.courtId}`,
    surface: getSurface(court),
    date: start,
    startTime: formatTime(start),
    hours,
    pricePerHour: hours > 0 ? booking.courtPrice / hours : booking.courtPrice,
    equipments: [],
    status: getStatus(booking, now),
  }
}

export default function MyReservationsPage({ user, onNavigate, onLogout }: MyReservationsPageProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [activeFilter, setActiveFilter] = useState<Filter>('upcoming')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const loadData = useCallback(
    () =>
      Promise.all([listUserBookings(user.id), listCourts()])
        .then(([loadedBookings, loadedCourts]) => {
          setBookings(loadedBookings)
          setCourts(loadedCourts)
          setLoadError(null)
        })
        .catch((caught: unknown) => {
          setLoadError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar suas reservas.')
        })
        .finally(() => setLoading(false)),
    [user.id],
  )

  useEffect(() => {
    loadData()
  }, [loadData])

  const courtsById = useMemo(() => new Map(courts.map((court) => [court.id, court])), [courts])

  const reservations = useMemo(() => {
    const now = new Date()
    return bookings.map((booking) => toReservation(booking, courtsById, now))
  }, [bookings, courtsById])

  const counts = useMemo(
    () => ({
      upcoming: reservations.filter((reservation) => reservation.status === 'upcoming').length,
      completed: reservations.filter((reservation) => reservation.status === 'completed').length,
      cancelled: reservations.filter((reservation) => reservation.status === 'cancelled').length,
      all: reservations.length,
    }),
    [reservations],
  )

  const stats = useMemo(() => {
    const playedHours = reservations
      .filter((reservation) => reservation.status === 'completed')
      .reduce((total, reservation) => total + reservation.hours, 0)
    const invested = reservations
      .filter((reservation) => reservation.status !== 'cancelled')
      .reduce((total, reservation) => total + reservation.pricePerHour * reservation.hours, 0)

    return { playedHours, invested }
  }, [reservations])

  const visibleReservations = useMemo(() => {
    const filtered =
      activeFilter === 'all' ? reservations : reservations.filter((reservation) => reservation.status === activeFilter)

    return [...filtered].sort((first, second) =>
      first.status === 'upcoming' && second.status === 'upcoming'
        ? first.date.getTime() - second.date.getTime()
        : second.date.getTime() - first.date.getTime(),
    )
  }, [reservations, activeFilter])

  function toggleDetails(id: string) {
    setExpandedId((current) => (current === id ? null : id))
  }

  function requestCancel(reservationId: string) {
    setActionError(null)
    setBookingToCancel(bookings.find((booking) => String(booking.id) === reservationId) ?? null)
  }

  async function confirmCancel() {
    if (!bookingToCancel) return

    setCancelling(true)

    try {
      await cancelBooking(bookingToCancel.id)
      setBookingToCancel(null)
      await loadData()
    } catch (caught) {
      setBookingToCancel(null)
      setActionError(
        caught instanceof ApiError && caught.status === 0
          ? caught.message
          : 'Não foi possível cancelar esta reserva. Ela pode já ter começado ou sido cancelada.',
      )
    } finally {
      setCancelling(false)
    }
  }

  const cancelStart = bookingToCancel ? parseLocalDateTime(bookingToCancel.startTime) : null
  const cancelPolicy = cancelStart ? getRefundPolicy(cancelStart) : null

  return (
    <div className="reservations-page">
      <AppHeader
        activeItem="reservations"
        navigationItems={getNavigationItems(user)}
        onNavigate={onNavigate}
        onAvatarClick={onLogout}
        avatarLabel={getInitials(user.name)}
      />

      <main className="reservations-main">
        <div className="reservations-heading">
          <PageHeading
            eyebrow="MINHA AGENDA"
            title="Meus agendamentos"
            description="Acompanhe suas próximas partidas, consulte o histórico e cancele quando precisar."
          />
          <button type="button" className="reservations-new" onClick={() => onNavigate('booking')}>
            Agendar nova partida
          </button>
        </div>

        {loadError && (
          <div className="reservations-alert" role="alert">
            {loadError}
          </div>
        )}
        {actionError && (
          <div className="reservations-alert" role="alert">
            {actionError}
          </div>
        )}

        <div className="reservations-stats">
          <div className="reservations-stat">
            <span>PRÓXIMAS PARTIDAS</span>
            <strong>{counts.upcoming}</strong>
          </div>
          <div className="reservations-stat">
            <span>PARTIDAS REALIZADAS</span>
            <strong>{counts.completed}</strong>
          </div>
          <div className="reservations-stat">
            <span>HORAS EM QUADRA</span>
            <strong>{formatDuration(stats.playedHours)}</strong>
          </div>
          <div className="reservations-stat">
            <span>TOTAL INVESTIDO</span>
            <strong>{formatCurrency(stats.invested)}</strong>
          </div>
        </div>

        <div className="reservations-filters" role="group" aria-label="Filtrar reservas">
          {filters.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              className={`reservations-filter${value === activeFilter ? ' reservations-filter--active' : ''}`}
              onClick={() => setActiveFilter(value)}
              aria-pressed={value === activeFilter}
            >
              {label}
              <i>{counts[value]}</i>
            </button>
          ))}
        </div>

        {loading && (
          <div className="reservations-empty">
            <p>Carregando suas reservas…</p>
          </div>
        )}

        {!loading && visibleReservations.length > 0 && (
          <div className="reservations-list">
            {visibleReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                expanded={reservation.id === expandedId}
                onToggleDetails={() => toggleDetails(reservation.id)}
                onCancel={() => requestCancel(reservation.id)}
                onRebook={() => onNavigate('booking')}
              />
            ))}
          </div>
        )}

        {!loading && visibleReservations.length === 0 && (
          <div className="reservations-empty">
            <p>{emptyMessages[activeFilter]}</p>
            <button type="button" onClick={() => onNavigate('booking')}>
              Ir para o calendário
            </button>
          </div>
        )}
      </main>

      {bookingToCancel && cancelStart && (
        <ConfirmDialog
          eyebrow="CANCELAR RESERVA"
          title={courtsById.get(bookingToCancel.courtId)?.name ?? `Quadra #${bookingToCancel.courtId}`}
          description={
            <>
              <p>
                Tem certeza que deseja cancelar a reserva{' '}
                <strong>AB-{String(bookingToCancel.id).padStart(4, '0')}</strong> do dia{' '}
                <strong>{formatShortDate(cancelStart)}</strong> às <strong>{formatTime(cancelStart)}</strong>?
              </p>
              <p>
                {cancelPolicy?.description} Estorno previsto:{' '}
                <strong>{formatCurrency(bookingToCancel.courtPrice * (cancelPolicy?.rate ?? 0))}</strong>.
              </p>
            </>
          }
          confirmLabel={cancelling ? 'Cancelando…' : 'Cancelar reserva'}
          dismissLabel="Manter reserva"
          onConfirm={() => void confirmCancel()}
          onClose={() => setBookingToCancel(null)}
        />
      )}
    </div>
  )
}
