import type { Booking, CourtType } from './api/types'
import { getHoursBetween, parseLocalDateTime } from './datetime'

/**
 * Espelho das regras que o BookingService aplica no backend. Serve só para
 * mostrar o valor/estorno esperado antes de chamar a API — o valor oficial é
 * sempre o que o backend devolve.
 */
const BASE_PRICE_PER_HOUR: Record<CourtType, number> = { OPEN: 100, COVERED: 120 }
const PEAK_START_HOUR = 18
const PEAK_END_HOUR = 22
const PEAK_MULTIPLIER = 1.2

function getPeakMinutes(start: Date, end: Date) {
  let minutes = 0
  let cursor = new Date(start)

  while (cursor < end) {
    const peakStart = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), PEAK_START_HOUR)
    const peakEnd = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), PEAK_END_HOUR)

    const sliceStart = cursor > peakStart ? cursor : peakStart
    const sliceEnd = end < peakEnd ? end : peakEnd
    minutes += Math.max(0, (sliceEnd.getTime() - sliceStart.getTime()) / 60_000)

    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
  }

  return minutes
}

export function estimatePrice(start: Date, end: Date, type: CourtType): number {
  const totalMinutes = (end.getTime() - start.getTime()) / 60_000
  if (totalMinutes <= 0) return 0

  const basePerMinute = BASE_PRICE_PER_HOUR[type] / 60
  const peakMinutes = getPeakMinutes(start, end)
  const normalMinutes = totalMinutes - peakMinutes
  const total = basePerMinute * normalMinutes + basePerMinute * PEAK_MULTIPLIER * peakMinutes

  return Math.round(total * 100) / 100
}

export function getBasePricePerHour(type: CourtType) {
  return BASE_PRICE_PER_HOUR[type]
}

export type RefundPolicy = {
  rate: number
  label: string
  description: string
}

/**
 * Política de estorno do backend: >= 24h antes devolve 100%, >= 12h devolve 50%,
 * abaixo disso não há devolução. As horas são truncadas, como em Duration.toHours().
 */
export function getRefundPolicy(startTime: Date, now: Date = new Date()): RefundPolicy {
  const hoursUntilStart = Math.floor(getHoursBetween(now, startTime))

  if (hoursUntilStart >= 24) {
    return {
      rate: 1,
      label: 'Estorno integral',
      description: 'Faltam mais de 24 horas para o início: você recebe 100% do valor pago.',
    }
  }

  if (hoursUntilStart >= 12) {
    return {
      rate: 0.5,
      label: 'Estorno de 50%',
      description: 'O cancelamento está entre 12 e 24 horas do início: metade do valor é devolvida.',
    }
  }

  return {
    rate: 0,
    label: 'Sem estorno',
    description: 'Faltam menos de 12 horas para o início, portanto não há devolução do valor.',
  }
}

export type CancellationCheck = { allowed: boolean; reason?: string }

/** Mesmas validações do BookingService.cancel, avaliadas antes de chamar a API. */
export function checkCancellation(booking: Booking, now: Date = new Date()): CancellationCheck {
  if (booking.status === 'CANCELLED') {
    return { allowed: false, reason: 'Esta reserva já está cancelada.' }
  }
  if (booking.status === 'COMPLETED') {
    return { allowed: false, reason: 'Reservas já realizadas não podem ser canceladas.' }
  }
  if (now >= parseLocalDateTime(booking.startTime)) {
    return { allowed: false, reason: 'Não é possível cancelar uma reserva que já começou.' }
  }

  return { allowed: true }
}
