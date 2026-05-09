'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from './auth'

function parseToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}

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
