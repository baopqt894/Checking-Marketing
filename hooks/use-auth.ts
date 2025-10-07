'use client'

import { useState, useEffect } from 'react'
import { getUserInfo, getAccessToken, getRefreshToken, type UserInfo } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get auth data from cookies/localStorage
    const token = getAccessToken()
    const refresh = getRefreshToken()
    const userInfo = getUserInfo()

    setAccessToken(token)
    setRefreshToken(refresh)
    setUser(userInfo)
    setIsAuthenticated(!!token)
    setIsLoading(false)
  }, [])

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading
  }
}
