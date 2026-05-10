'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, parseToken } from './auth'

export function useAuth(redirectTo: string = '/login', requiredRole: string = '') {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace(redirectTo)
      return
    }

    if (requiredRole) {
      const payload = parseToken(token)
      if (!payload || payload.role !== requiredRole) {
        router.replace(redirectTo)
        return
      }
    }

    setChecked(true)
  }, [router, redirectTo, requiredRole])

  return checked
}
