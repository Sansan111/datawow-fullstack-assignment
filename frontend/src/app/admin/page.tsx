'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react'
import { useAuth } from '@/app/lib/useAuth'
import AdminSidebar from '@/app/components/AdminSidebar'
import StatCards from '@/app/components/StatCards'
import Toast from '@/app/components/Toast'
import DeleteConfirmDialog from '@/app/components/DeleteConfirmDialog'
import { getConcerts, createConcert, deleteConcert, getReservationStats } from '@/app/lib/concerts'
import type { Concert } from '@/app/lib/concerts'

function SeatIconSmall() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

type Tab = 'overview' | 'create'

export default function AdminDashboardPage() {
  const isReady = useAuth('/admin/login', 'ADMIN')
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [concerts, setConcerts] = useState<Concert[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSeats, setTotalSeats] = useState(0)
  const [reserved, setReserved] = useState(0)
  const [cancelled, setCancelled] = useState(0)

  const [concertName, setConcertName] = useState('')
  const [concertSeats, setConcertSeats] = useState('')
  const [concertDesc, setConcertDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Concert | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [concertList, stats] = await Promise.all([
        getConcerts(),
        getReservationStats().catch(() => ({ activeReservations: 0, canceledReservations: 0 })),
      ])
      setConcerts([...concertList].reverse())

      const seats = concertList.reduce((sum, c) => sum + c.totalSeats, 0)
      setTotalSeats(seats)

      setReserved(stats.activeReservations)
      setCancelled(stats.canceledReservations)
    } catch {
      // silently fail if not authenticated yet
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!concertName.trim()) return

    setSaving(true)
    try {
      await createConcert({
        name: concertName,
        description: concertDesc,
        totalSeats: Number(concertSeats) || 1,
      })
      setConcertName('')
      setConcertSeats('')
      setConcertDesc('')
      setToast({ message: 'Create successfully', type: 'success' })
      setActiveTab('overview')
      fetchData()
    } catch {
      setToast({ message: 'Failed to create concert', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteConcert(deleteTarget.id)
      setDeleteTarget(null)
      setToast({ message: 'Delete successfully', type: 'success' })
      fetchData()
    } catch {
      setToast({ message: 'Failed to delete concert', type: 'error' })
      setDeleteTarget(null)
    }
  }

  if (!isReady) return null

  return (
    <div className="flex min-h-screen bg-[#fbfbfb]">
      <AdminSidebar />

      <main className="flex-1 flex flex-col gap-12 p-10 md:p-16 overflow-auto ml-[242px]">
        <StatCards totalSeats={totalSeats} reserved={reserved} cancelled={cancelled} />

        {/* Tabs */}
        <section className="flex flex-col gap-[22px] w-full">
          <div className="flex items-start gap-[22px]" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 text-2xl tracking-[0] leading-normal ${
                activeTab === 'overview'
                  ? 'font-semibold text-[#1692ec] border-b-2 border-[#1692ec]'
                  : 'font-normal text-[#5c5c5c]'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'create'}
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2.5 text-2xl tracking-[0] leading-normal ${
                activeTab === 'create'
                  ? 'font-semibold text-[#1692ec] border-b-2 border-[#1692ec]'
                  : 'font-normal text-[#5c5c5c]'
              }`}
            >
              Create
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-[22px]">
              {loading && (
                <p className="text-[#5c5c5c] text-xl italic p-10">Loading...</p>
              )}
              {!loading && concerts.length === 0 && (
                <p className="text-[#5c5c5c] text-xl italic p-10">No concerts yet. Create one!</p>
              )}
              {concerts.map((concert) => (
                <article
                  key={concert.id}
                  className="flex flex-col w-full items-start gap-8 p-10 bg-white rounded-lg border border-[#c2c2c2]"
                >
                  <div className="flex flex-col items-start gap-6 w-full">
                    <h2 className="font-semibold text-[#1692ec] text-[32px] leading-normal tracking-[0]">
                      {concert.name}
                    </h2>
                    <hr className="w-full border-[#c2c2c2]" />
                    <p className="font-normal text-black text-2xl leading-9 tracking-[0]">
                      {concert.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <SeatIconSmall />
                      <span className="font-normal text-black text-2xl leading-9 tracking-[0]">
                        {concert.totalSeats}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(concert)}
                      className="flex w-40 items-center justify-center gap-2.5 px-4 py-3 bg-[#e84d4d] rounded hover:opacity-90 transition-opacity"
                    >
                      <DeleteIcon />
                      <span className="font-medium text-white text-2xl leading-9 tracking-[0]">
                        Delete
                      </span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Create Tab */}
          {activeTab === 'create' && (
            <form
              onSubmit={handleCreate}
              className="flex flex-col w-full items-end gap-8 p-10 bg-white rounded-lg border border-[#c2c2c2]"
            >
              <div className="flex flex-col items-start gap-6 w-full">
                <h2 className="font-semibold text-[#1692ec] text-[40px] leading-normal tracking-[0]">
                  Create
                </h2>
                <hr className="w-full border-[#c2c2c2]" />

                <div className="flex flex-col md:flex-row items-start gap-6 w-full">
                  <div className="flex flex-col items-start gap-4 flex-1 w-full">
                    <label className="font-normal text-black text-2xl leading-9 tracking-[0]">
                      Concert Name
                    </label>
                    <div className="flex items-center gap-[10px] px-4 py-3 w-full h-12 bg-white rounded-[4px] border border-[#5c5c5c]">
                      <input
                        type="text"
                        value={concertName}
                        onChange={(e) => setConcertName(e.target.value)}
                        placeholder="Please input concert name"
                        className="flex-1 font-normal text-[#5c5c5c] text-base leading-6 tracking-[0] placeholder:text-[#c2c2c2] outline-none bg-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-4 flex-1 w-full">
                    <label className="font-normal text-black text-2xl leading-9 tracking-[0]">
                      Total of seat
                    </label>
                    <div className="flex items-center gap-[10px] px-4 py-3 w-full h-12 bg-white rounded-[4px] border border-[#5c5c5c]">
                      <input
                        type="number"
                        min="1"
                        value={concertSeats}
                        onChange={(e) => setConcertSeats(e.target.value)}
                        placeholder="Please input total seats"
                        className="flex-1 font-normal text-[#5c5c5c] text-base leading-6 tracking-[0] placeholder:text-[#c2c2c2] outline-none bg-transparent"
                        required
                      />
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-4 w-full">
                  <label className="font-normal text-black text-2xl leading-9 tracking-[0]">
                    Description
                  </label>
                  <div className="flex items-start gap-2.5 px-4 py-3 w-full h-[102px] bg-white rounded border border-[#5c5c5c]">
                    <textarea
                      value={concertDesc}
                      onChange={(e) => setConcertDesc(e.target.value)}
                      placeholder="Please input description"
                      className="flex-1 h-full resize-none font-normal text-[#5c5c5c] text-base leading-6 tracking-[0] placeholder:text-[#c2c2c2] outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-40 items-center justify-center gap-2.5 px-4 py-3 bg-[#1591eb] rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <SaveIcon />
                <span className="font-medium text-white text-2xl leading-9 tracking-[0]">
                  {saving ? 'Saving...' : 'Save'}
                </span>
              </button>
            </form>
          )}
        </section>
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteConfirmDialog
          concertName={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
