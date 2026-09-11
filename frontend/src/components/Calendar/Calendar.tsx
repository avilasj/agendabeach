import { useMemo } from 'react'
import { toDateString } from '../../datetime'
import './Calendar.css'

export type Availability = 'available' | 'limited' | 'full'

type CalendarDay = {
  date: Date
  day: number
  status?: Availability
  disabled: boolean
}

type CalendarProps = {
  displayedMonth: Date
  selectedDate: Date | null
  /** Ocupação real de cada dia (chave YYYY-MM-DD), calculada a partir das reservas do banco. */
  availability: Record<string, Availability>
  /** Primeiro dia que ainda pode ser reservado — normalmente hoje. */
  minDate: Date
  onChangeMonth: (offset: number) => void
  onSelectDate: (date: Date) => void
}

const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

const availabilityLabels: Record<Availability, string> = {
  available: 'Vários',
  limited: 'Poucos',
  full: 'Lotado',
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function createCalendarDays(month: Date, availability: Record<string, Availability>, minDate: Date): CalendarDay[] {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const totalDays = new Date(year, monthIndex + 1, 0).getDate()
  const firstBookableDate = startOfDay(minDate)

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(year, monthIndex, index + 1)

    if (date < firstBookableDate) {
      return { date, day: index + 1, disabled: true }
    }

    const status = availability[toDateString(date)] ?? 'available'
    return { date, day: index + 1, status, disabled: status === 'full' }
  })
}

function getMonthLabel(date: Date) {
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date)
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`
}

function getFullDateLabel(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function isSameDate(first: Date | null, second: Date) {
  return (
    first?.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={direction === 'left' ? 'm14.5 6-6 6 6 6' : 'm9.5 6 6 6-6 6'} />
    </svg>
  )
}

export function Calendar({
  displayedMonth,
  selectedDate,
  availability,
  minDate,
  onChangeMonth,
  onSelectDate,
}: CalendarProps) {
  const calendarDays = useMemo(
    () => createCalendarDays(displayedMonth, availability, minDate),
    [displayedMonth, availability, minDate],
  )
  const leadingEmptyDays = displayedMonth.getDay()

  return (
    <section className="calendar-card" aria-labelledby="calendar-title">
      <div className="booking-step">
        <span>1</span>
        <strong id="calendar-title">SELECIONE O DIA</strong>
      </div>

      <div className="calendar-toolbar">
        <h2 aria-live="polite">{getMonthLabel(displayedMonth)}</h2>
        <div>
          <button type="button" onClick={() => onChangeMonth(-1)} aria-label="Mês anterior">
            <ChevronIcon direction="left" />
          </button>
          <button type="button" onClick={() => onChangeMonth(1)} aria-label="Próximo mês">
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>

      <div className="calendar-grid calendar-grid--weekdays" aria-hidden="true">
        {weekdays.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="calendar-grid calendar-grid--days">
        {Array.from({ length: leadingEmptyDays }, (_, index) => (
          <span key={`spacer-${index}`} className="calendar-spacer" aria-hidden="true" />
        ))}

        {calendarDays.map(({ date, day, status, disabled }) => {
          const isSelected = isSameDate(selectedDate, date)

          return (
            <button
              key={date.toISOString()}
              type="button"
              className={`calendar-day${disabled ? ' calendar-day--disabled' : ''}${status === 'full' ? ' calendar-day--full' : ''}${isSelected ? ' calendar-day--selected' : ''}`}
              disabled={disabled}
              onClick={() => onSelectDate(date)}
              aria-pressed={isSelected}
              aria-label={`${getFullDateLabel(date)}${status ? `, ${availabilityLabels[status]} horários` : ''}`}
            >
              <strong>{day}</strong>
              {status && <span className={`availability availability--${status}`}>{availabilityLabels[status]}</span>}
            </button>
          )
        })}
      </div>

      <div className="calendar-legend" aria-label="Legenda de disponibilidade">
        <span>
          <i className="legend-dot legend-dot--available" />
          Vários horários
        </span>
        <span>
          <i className="legend-dot legend-dot--limited" />
          Poucos horários
        </span>
        <span>
          <i className="legend-dot legend-dot--full" />
          Lotado
        </span>
      </div>
    </section>
  )
}
