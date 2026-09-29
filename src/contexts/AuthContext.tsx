import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiRequest, setCsrfToken } from '../services/api'
import type { AuthUser } from '../types/api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const applyUser = (nextUser: AuthUser | null) => {
    setUser(nextUser)
    setCsrfToken(nextUser?.csrf_token || '')
  }

  const refreshUser = async () => {
    try {
      const currentUser = await apiRequest<AuthUser>('/auth/me')
      applyUser(currentUser)
    } catch {
      applyUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void refreshUser()
  }, [])

  const login = async (username: string, password: string) => {
    const loggedInUser = await apiRequest<AuthUser>('/auth/login', {
      method: 'POST',
      body: { nama_pengguna: username.trim().toLowerCase(), kata_sandi: password },
    })
    applyUser(loggedInUser)
    return loggedInUser
  }

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } finally {
      applyUser(null)
    }
  }

  const value = useMemo(() => ({ user, loading, login, logout, refreshUser }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
