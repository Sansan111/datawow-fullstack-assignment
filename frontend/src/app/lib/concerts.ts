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
  status: string
  createdAt: string
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
