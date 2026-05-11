'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/lib/useAuth'
import Sidebar from '@/app/components/Sidebar'
import HistoryTable from '@/app/components/HistoryTable'
import { getAllReservations } from '@/app/lib/concerts'
import type { AuditLog } from '@/app/lib/concerts'

export default function AdminHistoryPage() {
  const { isReady } = useAuth('/admin/login', 'ADMIN')
  const [logs, setLogs] = useState<AuditLog[]>([])

  const fetchData = useCallback(async () => {
    try {
      const data = await getAllReservations()
      setLogs(data)
    } catch {
      // not authenticated
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (!isReady) return null

  return (
    <div className="flex min-h-screen bg-[#fbfbfb]">
      <Sidebar
        title="Admin"
        homePath="/admin"
        historyPath="/admin/history"
        switchLabel="Switch to User"
        switchPath="/user"
        logoutPath="/admin/login"
      />

      <main className="flex-1 flex flex-col gap-12 p-10 md:p-16 overflow-auto ml-[242px]">
        <HistoryTable logs={logs} showUsername />
      </main>
    </div>
  )
}
