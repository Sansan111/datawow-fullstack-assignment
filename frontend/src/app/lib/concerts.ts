import api from './axios'

export interface Concert {
  id: number
  name: string
  description: string
  totalSeats: number
  createdAt: string
  updatedAt: string
}

export interface Reservation {
  id: number
  concertId: number
  userId: number
  createdAt: string
  concert: Concert
  user?: { email: string }
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

export async function getAllReservations(): Promise<Reservation[]> {
  const res = await api.get<Reservation[]>('/reservations/all')
  return res.data
}

export async function getMyReservations(): Promise<Reservation[]> {
  const res = await api.get<Reservation[]>('/reservations/history')
  return res.data
}

export async function reserveSeat(concertId: number): Promise<void> {
  await api.post('/reservations', { concertId })
}

export async function cancelReservation(reservationId: number): Promise<void> {
  await api.delete(`/reservations/${reservationId}`)
}
