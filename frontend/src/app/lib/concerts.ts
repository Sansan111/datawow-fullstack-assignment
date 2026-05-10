import api from './axios'

export interface Concert {
  id: number
  name: string
  description: string
  totalSeats: number
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  _count?: { reservations: number }
}

export interface Reservation {
  id: number
  concertId: number
  userId: number
  status: 'RESERVED' | 'CANCELLED'
  createdAt: string
  concert: Concert
  user?: { email: string }
}

export interface AuditLog {
  id: number
  userId: number
  concertId: number
  action: 'RESERVE' | 'CANCEL' | 'EVENT_DELETED'
  createdAt: string
  concert: Concert
  user?: { email: string }
}

export interface ReservationStats {
  activeReservations: number
  canceledReservations: number
}

export async function getConcerts(): Promise<Concert[]> {
  const res = await api.get<Concert[]>('/concerts')
  return res.data
}

export async function createConcert(data: { name: string; description: string; totalSeats: number }): Promise<Concert> {
  const res = await api.post<Concert>('/concerts', data)
  return res.data
}

export async function deleteConcert(id: number): Promise<void> {
  await api.delete(`/concerts/${id}`)
}

export async function getAllReservations(): Promise<AuditLog[]> {
  const res = await api.get<AuditLog[]>('/reservations/all')
  return res.data
}

export async function getMyReservations(): Promise<AuditLog[]> {
  const res = await api.get<AuditLog[]>('/reservations/history')
  return res.data
}

export async function getMyActiveReservations(): Promise<Reservation[]> {
  const res = await api.get<Reservation[]>('/reservations/active')
  return res.data
}

export async function reserveSeat(concertId: number): Promise<void> {
  await api.post('/reservations', { concertId })
}

export async function cancelReservation(reservationId: number): Promise<void> {
  await api.patch(`/reservations/${reservationId}/cancel`)
}

export async function getReservationStats(): Promise<ReservationStats> {
  const res = await api.get<ReservationStats>('/reservations/stats')
  return res.data
}
