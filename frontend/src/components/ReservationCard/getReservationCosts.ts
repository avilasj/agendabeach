type PricedReservation = {
  hours: number
  pricePerHour: number
  equipments: { price: number; quantity: number }[]
}

/**
 * O valor da reserva é o que o backend calcula e grava em bookings.court_price.
 * Equipamentos são extras combinados no local e não entram nesse valor.
 */
export function getReservationCosts({ hours, pricePerHour, equipments }: PricedReservation) {
  const courtTotal = pricePerHour * hours
  const equipmentTotal = equipments.reduce((total, { price, quantity }) => total + price * quantity, 0)

  return { courtTotal, equipmentTotal, total: courtTotal }
}
