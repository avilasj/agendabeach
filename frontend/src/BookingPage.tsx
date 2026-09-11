import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppHeader, BookingModal, Calendar, PageHeading, ReservationSummary } from './components'
import type { Availability } from './components'
import { getNavigationItems } from './navigation'
import { ApiError, listBookings, listCourts } from './api'
import type { Booking, Court } from './api'
import { getInitials } from './session'
import type { SessionUser } from './session'
import { formatCurrency, formatShortDate, formatTime, parseLocalDateTime, toDateString } from './datetime'
import './BookingPage.css'

type BookingPageProps = {
  user: SessionUser
  onNavigate: (value: string) => void
  onLogout: () => void
}

const openingHour = 7
const closingHour = 23
const hoursPerDay = closingHour - openingHour

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export default function BookingPage({ user, onNavigate, onLogout }: BookingPageProps) {
  const [displayedMonth, setDisplayedMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const [courts, setCourts] = useState<Court[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [created, setCreated] = useState<Booking | null>(null)

  const loadData = useCallback(() => (
    Promise.all([listCourts(), listBookings()])
      .then(([loadedCourts, loadedBookings]) => {
        setCourts(loadedCourts)
        setBookings(loadedBookings)
        setLoadError(null)
      })
      .catch((caught: unknown) => {
        setLoadError(caught instanceof ApiError ? caught.message : 'Não foi possível carregar as quadras.')
      })
  ), [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const activeCourts = useMemo(() => courts.filter((court) => court.status === 'ACTIVE'), [courts])

  /** Ocupação real de cada dia: horas reservadas ÷ horas disponíveis nas quadras ativas. */
  const availability = useMemo(() => {
    const capacityPerDay = activeCourts.length * hoursPerDay
    if (capacityPerDay === 0) return {}

    const bookedHours: Record<string, number> = {}
    for (const booking of bookings) {
      if (booking.status === 'CANCELLED') continue

      const start = parseLocalDateTime(booking.startTime)
      const end = parseLocalDateTime(booking.endTime)
      const key = toDateString(start)
      bookedHours[key] = (bookedHours[key] ?? 0) + (end.getTime() - start.getTime()) / 3_600_000
    }

    const result: Record<string, Availability> = {}
    for (const [key, hours] of Object.entries(bookedHours)) {
      const ratio = hours / capacityPerDay
      result[key] = ratio >= 1 ? 'full' : ratio >= 0.6 ? 'limited' : 'available'
    }

    return result
  }, [activeCourts, bookings])

  function changeMonth(offset: number) {
    setDisplayedMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1))
  }

  function handleConfirmed(booking: Booking) {
    setCreated(booking)
    setIsBookingModalOpen(false)
    setSelectedDate(null)
    void loadData()
  }

  const createdStart = created ? parseLocalDateTime(created.startTime) : null

  return (
    <div className="booking-page">
      <AppHeader
        activeItem="booking"
        navigationItems={getNavigationItems(user)}
        onNavigate={onNavigate}
        onAvatarClick={onLogout}
        avatarLabel={getInitials(user.name)}
      />

      <main className="booking-main">
        <PageHeading
          eyebrow="RESERVAS ONLINE"
          title="Agendar quadra"
          description="Toque em um dia disponível no calendário para escolher a quadra e o horário."
        />

        {loadError && <div className="booking-alert booking-alert--error" role="alert">{loadError}</div>}

        {created && createdStart && (
          <div className="booking-alert booking-alert--success" role="status">
            <strong>Reserva confirmada!</strong>
            <span>
              {formatShortDate(createdStart)} às {formatTime(createdStart)} ·{' '}
              {courts.find((court) => court.id === created.courtId)?.name ?? `Quadra #${created.courtId}`} ·{' '}
              {formatCurrency(created.courtPrice)}
            </span>
            <button type="button" onClick={() => onNavigate('reservations')}>Ver minhas reservas</button>
          </div>
        )}

        {!loadError && activeCourts.length === 0 && (
          <div className="booking-alert booking-alert--warn" role="status">
            Nenhuma quadra ativa cadastrada. Peça a um administrador para cadastrar ou reativar uma quadra.
          </div>
        )}

        <div className="booking-layout">
          <Calendar
            displayedMonth={displayedMonth}
            selectedDate={selectedDate}
            availability={availability}
            minDate={new Date()}
            onChangeMonth={changeMonth}
            onSelectDate={setSelectedDate}
          />
          <ReservationSummary selectedDate={selectedDate} onOpenBooking={() => setIsBookingModalOpen(true)} />
        </div>
      </main>

      {isBookingModalOpen && selectedDate && (
        <BookingModal
          selectedDate={selectedDate}
          courts={activeCourts}
          userId={user.id}
          onClose={() => setIsBookingModalOpen(false)}
          onConfirmed={handleConfirmed}
        />
      )}
    </div>
  )
}
