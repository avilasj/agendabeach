/**
 * O backend trabalha com LocalDateTime (sem fuso), então as datas viajam como
 * "2026-06-18T19:00:00". Estas funções convertem para Date local e de volta,
 * sem deixar o navegador aplicar deslocamento de fuso.
 */

export function parseLocalDateTime(value: string): Date {
  if (value.length === 10) return new Date(`${value}T00:00:00`)

  // O Java devolve até 9 casas de fração (ex.: cancelledAt "08:53:53.358905586"),
  // mas o formato de data do JavaScript só garante 3 — cortamos o excesso.
  return new Date(value.replace(/(\.\d{3})\d+/, '$1'))
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function toLocalDateTimeString(date: Date): string {
  return `${toDateString(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

/** Formato aceito por /bookings/search e por inputs <input type="date">. */
export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0)
}

export function getHoursBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / 3_600_000
}

export const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatCurrency(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

export function formatTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatDuration(hours: number) {
  const totalMinutes = Math.round(hours * 60)
  const wholeHours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (wholeHours === 0) return `${minutes}min`
  if (minutes === 0) return `${wholeHours}h`
  return `${wholeHours}h${pad(minutes)}`
}
