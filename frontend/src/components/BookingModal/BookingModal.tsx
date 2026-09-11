import { useEffect, useMemo, useState } from 'react'
import { ApiError, createBooking, searchBookings } from '../../api'
import type { Booking, Court } from '../../api'
import { combineDateAndTime, formatCurrency, formatFullDate, toDateString, toLocalDateTimeString } from '../../datetime'
import { estimatePrice, getBasePricePerHour } from '../../pricing'
import './BookingModal.css'

type Equipment = {
  id: string
  name: string
  description: string
  price: number
  max: number
}

type Duration = {
  label: string
  hours: number
}

type BookingModalProps = {
  selectedDate: Date
  /** Quadras ativas vindas de GET /courts. */
  courts: Court[]
  userId: number
  onClose: () => void
  onConfirmed: (booking: Booking) => void
}

/**
 * Extras combinados no balcão: o banco não guarda equipamentos, então eles não
 * entram no valor da reserva enviado para a API.
 */
const equipments: Equipment[] = [
  { id: 'bola', name: 'Bola oficial', description: 'Bola de vôlei ou futevôlei', price: 15, max: 4 },
  { id: 'raquetes', name: 'Par de raquetes', description: 'Beach tennis com bolinhas', price: 25, max: 4 },
  { id: 'rede', name: 'Rede extra', description: 'Rede reserva com regulagem de altura', price: 30, max: 2 },
  { id: 'iluminacao', name: 'Iluminação noturna', description: 'Refletores para jogos após as 18h', price: 40, max: 1 },
  { id: 'coletes', name: 'Kit de coletes', description: '10 coletes numerados', price: 10, max: 3 },
  { id: 'cooler', name: 'Cooler com gelo', description: 'Cooler 20L com água gelada', price: 20, max: 2 },
]

const durations: Duration[] = [
  { label: '1 hora', hours: 1 },
  { label: '1h30', hours: 1.5 },
  { label: '2 horas', hours: 2 },
]

const openingHour = 7
const closingHour = 23
const noBookings: Booking[] = []

const timeSlots = Array.from(
  { length: closingHour - openingHour },
  (_, index) => `${String(openingHour + index).padStart(2, '0')}:00`,
)

function getSurfaceLabel(court: Court) {
  return court.type === 'COVERED' ? 'Areia oficial · Coberta' : 'Areia oficial · Ao ar livre'
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function toTimeLabel(totalMinutes: number) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const minutes = String(totalMinutes % 60).padStart(2, '0')
  return `${hours}:${minutes}`
}

function getDurationLabel(hours: number) {
  return durations.find((duration) => duration.hours === hours)?.label ?? `${hours} horas`
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 12h12" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 6v12M6 12h12" />
    </svg>
  )
}

export function BookingModal({ selectedDate, courts, userId, onClose, onConfirmed }: BookingModalProps) {
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedHours, setSelectedHours] = useState(1)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [busyState, setBusyState] = useState<{ courtId: number; items: Booking[] } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Horários já ocupados da quadra escolhida, direto de /bookings/search.
  useEffect(() => {
    if (selectedCourtId === null) return

    let active = true

    searchBookings(toDateString(selectedDate), selectedCourtId)
      .then((found) => {
        if (!active) return
        setBusyState({ courtId: selectedCourtId, items: found.filter((booking) => booking.status !== 'CANCELLED') })
      })
      .catch(() => {
        if (!active) return
        setBusyState({ courtId: selectedCourtId, items: [] })
        setError('Não foi possível carregar os horários ocupados desta quadra. Confirme antes de reservar.')
      })

    return () => {
      active = false
    }
  }, [selectedCourtId, selectedDate])

  const selectedCourt = courts.find((court) => court.id === selectedCourtId) ?? null
  const loadingSlots = selectedCourtId !== null && busyState?.courtId !== selectedCourtId
  const busy = busyState?.courtId === selectedCourtId ? busyState.items : noBookings

  const courtSlots = useMemo(() => {
    if (!selectedCourt) return []

    const now = new Date().getTime()
    const busyIntervals = busy.map((booking) => ({
      start: new Date(booking.startTime).getTime(),
      end: new Date(booking.endTime).getTime(),
    }))

    return timeSlots.map((slot) => {
      const startMinutes = toMinutes(slot)
      const endMinutes = startMinutes + selectedHours * 60
      const start = combineDateAndTime(selectedDate, slot).getTime()
      const end = start + selectedHours * 3_600_000

      const overlapsBooked = busyIntervals.some((interval) => start < interval.end && end > interval.start)
      const afterClosing = endMinutes > closingHour * 60
      const inThePast = start <= now

      return { slot, disabled: overlapsBooked || afterClosing || inThePast }
    })
  }, [selectedCourt, selectedHours, busy, selectedDate])

  const chosenEquipments = useMemo(
    () =>
      equipments
        .map((equipment) => ({ equipment, quantity: quantities[equipment.id] ?? 0 }))
        .filter(({ quantity }) => quantity > 0),
    [quantities],
  )

  const endTime = selectedTime ? toTimeLabel(toMinutes(selectedTime) + selectedHours * 60) : null
  const equipmentTotal = chosenEquipments.reduce(
    (total, { equipment, quantity }) => total + equipment.price * quantity,
    0,
  )

  const courtTotal = useMemo(() => {
    if (!selectedCourt || !selectedTime) return 0

    const start = combineDateAndTime(selectedDate, selectedTime)
    const end = new Date(start.getTime() + selectedHours * 3_600_000)
    return estimatePrice(start, end, selectedCourt.type)
  }, [selectedCourt, selectedTime, selectedHours, selectedDate])

  const isComplete = Boolean(selectedCourt && selectedTime)

  function changeQuantity(equipmentId: string, offset: number, max: number) {
    setQuantities((current) => ({
      ...current,
      [equipmentId]: Math.min(Math.max((current[equipmentId] ?? 0) + offset, 0), max),
    }))
  }

  function selectCourt(courtId: number) {
    setSelectedCourtId(courtId)
    setSelectedTime(null)
    setError(null)
  }

  function changeDuration(hours: number) {
    setSelectedHours(hours)
    setSelectedTime(null)
  }

  async function confirmReservation() {
    if (!selectedCourt || !selectedTime) return

    const start = combineDateAndTime(selectedDate, selectedTime)
    const end = new Date(start.getTime() + selectedHours * 3_600_000)

    setSubmitting(true)
    setError(null)

    try {
      const booking = await createBooking({
        userId,
        courtId: selectedCourt.id,
        startTime: toLocalDateTimeString(start),
        endTime: toLocalDateTimeString(end),
      })
      onConfirmed(booking)
    } catch (caught) {
      setError(
        caught instanceof ApiError && (caught.status === 0 || caught.status === 409)
          ? caught.message
          : 'Não foi possível concluir a reserva. O horário pode ter sido ocupado agora há pouco.',
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
      <button type="button" className="booking-modal__backdrop" onClick={onClose} tabIndex={-1} aria-hidden="true" />

      <div className="booking-modal__dialog">
        <header className="booking-modal__header">
          <div>
            <span>RESERVA DE QUADRA</span>
            <h2 id="booking-modal-title">{formatFullDate(selectedDate)}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar reserva">
            <CloseIcon />
          </button>
        </header>

        <div className="booking-modal__content">
          <div className="booking-modal__steps">
            <section className="booking-modal__section" aria-labelledby="booking-step-court">
              <div className="booking-step">
                <span>2</span>
                <strong id="booking-step-court">ESCOLHA A QUADRA</strong>
              </div>

              {courts.length === 0 ? (
                <p className="booking-modal__hint">Nenhuma quadra ativa disponível no momento.</p>
              ) : (
                <div className="court-list">
                  {courts.map((court) => (
                    <button
                      key={court.id}
                      type="button"
                      className={`court-option${court.id === selectedCourtId ? ' court-option--selected' : ''}`}
                      onClick={() => selectCourt(court.id)}
                      aria-pressed={court.id === selectedCourtId}
                    >
                      <strong>{court.name}</strong>
                      <span className="court-option__surface">{getSurfaceLabel(court)}</span>
                      <span className="court-option__tags">
                        <i>Beach-Tennis</i>
                        <i>{court.type === 'COVERED' ? 'Coberta' : 'Ao ar livre'}</i>
                      </span>
                      <span className="court-option__price">
                        {formatCurrency(getBasePricePerHour(court.type))}
                        <small>/hora</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="booking-modal__section" aria-labelledby="booking-step-time">
              <div className="booking-step">
                <span>3</span>
                <strong id="booking-step-time">HORÁRIO E DURAÇÃO</strong>
              </div>

              <div className="duration-list" role="group" aria-label="Duração da reserva">
                {durations.map(({ label, hours }) => (
                  <button
                    key={label}
                    type="button"
                    className={`duration-option${hours === selectedHours ? ' duration-option--selected' : ''}`}
                    onClick={() => changeDuration(hours)}
                    aria-pressed={hours === selectedHours}
                  >
                    <ClockIcon />
                    {label}
                  </button>
                ))}
              </div>

              {!selectedCourt && (
                <p className="booking-modal__hint">Escolha uma quadra para ver os horários disponíveis.</p>
              )}
              {selectedCourt && loadingSlots && <p className="booking-modal__hint">Consultando horários ocupados…</p>}

              {selectedCourt && !loadingSlots && (
                <div className="time-grid">
                  {courtSlots.map(({ slot, disabled }) => (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot${slot === selectedTime ? ' time-slot--selected' : ''}`}
                      disabled={disabled}
                      onClick={() => setSelectedTime(slot)}
                      aria-pressed={slot === selectedTime}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="booking-modal__section" aria-labelledby="booking-step-equipment">
              <div className="booking-step">
                <span>4</span>
                <strong id="booking-step-equipment">EXTRAS (PAGOS NO LOCAL)</strong>
              </div>

              <ul className="equipment-list">
                {equipments.map((equipment) => {
                  const quantity = quantities[equipment.id] ?? 0

                  return (
                    <li
                      key={equipment.id}
                      className={`equipment-item${quantity > 0 ? ' equipment-item--selected' : ''}`}
                    >
                      <div className="equipment-item__info">
                        <strong>{equipment.name}</strong>
                        <span>{equipment.description}</span>
                      </div>

                      <span className="equipment-item__price">{formatCurrency(equipment.price)}</span>

                      <div className="equipment-item__stepper">
                        <button
                          type="button"
                          onClick={() => changeQuantity(equipment.id, -1, equipment.max)}
                          disabled={quantity === 0}
                          aria-label={`Remover ${equipment.name}`}
                        >
                          <MinusIcon />
                        </button>
                        <output aria-label={`Quantidade de ${equipment.name}`}>{quantity}</output>
                        <button
                          type="button"
                          onClick={() => changeQuantity(equipment.id, 1, equipment.max)}
                          disabled={quantity >= equipment.max}
                          aria-label={`Adicionar ${equipment.name}`}
                        >
                          <PlusIcon />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>

          <aside className="booking-modal__details" aria-live="polite">
            <h3>Detalhes da reserva</h3>

            {error && (
              <p className="booking-modal__error" role="alert">
                {error}
              </p>
            )}

            <dl className="reservation-details">
              <div>
                <dt>Data</dt>
                <dd>{formatFullDate(selectedDate)}</dd>
              </div>
              <div>
                <dt>Quadra</dt>
                <dd>{selectedCourt ? selectedCourt.name : <em>Não selecionada</em>}</dd>
              </div>
              <div>
                <dt>Horário</dt>
                <dd>{selectedTime && endTime ? `${selectedTime} às ${endTime}` : <em>Não selecionado</em>}</dd>
              </div>
              <div>
                <dt>Duração</dt>
                <dd>{getDurationLabel(selectedHours)}</dd>
              </div>
              <div>
                <dt>Extras</dt>
                <dd>
                  {chosenEquipments.length === 0 ? (
                    <em>Nenhum</em>
                  ) : (
                    chosenEquipments.map(({ equipment, quantity }) => (
                      <span key={equipment.id}>
                        {quantity}× {equipment.name}
                      </span>
                    ))
                  )}
                </dd>
              </div>
            </dl>

            <ul className="reservation-costs">
              <li>
                <span>Quadra ({getDurationLabel(selectedHours)})</span>
                <strong>{formatCurrency(courtTotal)}</strong>
              </li>
              <li>
                <span>Extras no local</span>
                <strong>{formatCurrency(equipmentTotal)}</strong>
              </li>
            </ul>

            <div className="reservation-total">
              <span>Total da reserva</span>
              <strong>{formatCurrency(courtTotal)}</strong>
            </div>

            <button
              type="button"
              className="reservation-confirm"
              disabled={!isComplete || submitting}
              onClick={() => void confirmReservation()}
            >
              {submitting ? 'Confirmando…' : isComplete ? 'Confirmar reserva' : 'Escolha quadra e horário'}
            </button>

            <p className="reservation-note">
              Pagamento na chegada. Cancelamento gratuito até 24 horas antes do início da partida; entre 12 e 24 horas,
              o estorno é de 50%.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
