'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/lib/useAuth'
import { POLLING_INTERVAL, extractErrorMessage } from '@/app/lib/auth'
import Sidebar from '@/app/components/Sidebar'
import Toast from '@/app/components/Toast'
import {
  getConcerts,
  getMyActiveReservations,
  reserveSeat,
  cancelReservation,
} from '@/app/lib/concerts'
import type { Concert, Reservation } from '@/app/lib/concerts'

function SeatIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function UserHomePage() {
  const isReady = useAuth('/login')
  const [concerts, setConcerts] = useState<Concert[]>([])
  const [myReservations, setMyReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [concertList, reservations] = await Promise.all([
        getConcerts(),
        getMyActiveReservations().catch(() => []),
      ])
      setConcerts([...concertList].reverse())
      setMyReservations(reservations)
    } catch {
      // not authenticated
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, POLLING_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  const findReservation = (concertId: number) =>
    myReservations.find((r) => r.concertId === concertId)

  const handleReserve = async (concertId: number) => {
    setBusyId(concertId)
    try {
      await reserveSeat(concertId)
      setToast({ message: 'Reserve successfully', type: 'success' })
      await fetchData()
    } catch (err: unknown) {
      setToast({ message: extractErrorMessage(err, 'Failed to reserve seat'), type: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  const handleCancel = async (reservationId: number, concertId: number) => {
    setBusyId(concertId)
    try {
      await cancelReservation(reservationId)
      setToast({ message: 'Cancel successfully', type: 'success' })
      await fetchData()
    } catch (err: unknown) {
      setToast({ message: extractErrorMessage(err, 'Failed to cancel reservation'), type: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  if (!isReady) return null

  return (
    <div className="flex min-h-screen bg-[#fbfbfb]">
      <Sidebar
        title="User"
        homePath="/user"
        historyPath="/user/history"
        switchLabel="Switch to Admin"
        switchPath="/admin/login"
        logoutPath="/login"
      />

      <main className="flex-1 flex flex-col gap-8 p-10 md:p-16 overflow-auto ml-[242px]">
        {loading && (
          <p className="text-[#5c5c5c] text-xl italic">Loading...</p>
        )}

        {!loading && concerts.length === 0 && (
          <p className="text-[#5c5c5c] text-xl italic">No concerts available.</p>
        )}

        {concerts.map((concert) => {
          const reservation = findReservation(concert.id)
          const isReserved = !!reservation
          const isFullyBooked = !isReserved && (concert._count?.reservations ?? 0) >= concert.totalSeats
          const isBusy = busyId === concert.id

          return (
            <article
              key={concert.id}
              className="flex flex-col w-full items-start gap-8 p-10 bg-white rounded-lg border border-[#c2c2c2]"
            >
              <div className="flex flex-col items-start gap-6 w-full">
                <h2 className="font-semibold text-[#1692ec] text-[40px] leading-normal tracking-[0] w-full break-all">
                  {concert.name}
                </h2>
                <hr className="w-full border-[#c2c2c2]" />
                <p className="font-normal text-black text-2xl leading-9 tracking-[0] w-full break-all">
                  {concert.description}
                </p>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <SeatIcon />
                  <span className="font-normal text-black text-2xl leading-9 tracking-[0]">
                    {concert.totalSeats}
                  </span>
                </div>

                {isReserved ? (
                  <button
                    type="button"
                    onClick={() => handleCancel(reservation!.id, concert.id)}
                    disabled={isBusy}
                    className="flex w-40 items-center justify-center gap-2.5 px-4 py-3 bg-[#f96464] rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <span className="font-medium text-white text-2xl leading-9 tracking-[0]">
                      {isBusy ? '...' : 'Cancel'}
                    </span>
                  </button>
                ) : isFullyBooked ? (
                  <button
                    type="button"
                    disabled
                    className="flex w-48 items-center justify-center gap-2.5 px-4 py-3 bg-[#9ca3af] rounded cursor-not-allowed"
                  >
                    <span className="font-medium text-white text-2xl leading-9 tracking-[0]">
                      Fully Booked
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleReserve(concert.id)}
                    disabled={isBusy}
                    className="flex w-40 items-center justify-center gap-2.5 px-4 py-3 bg-[#1591eb] rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <span className="font-medium text-white text-2xl leading-9 tracking-[0]">
                      {isBusy ? '...' : 'Reserve'}
                    </span>
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
