/**
 * Cookie utilities for authentication
 */

export interface UserInfo {
  id?: string
  email?: string
  name?: string
  role?: string
  [key: string]: any
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  userInfo?: UserInfo
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/**
 * Set authentication cookies
 */
export function setAuthCookies(tokens: AuthTokens): void {
  const cookieOptions = `path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`

  // Access Token
  document.cookie = `accessToken=${tokens.accessToken}; ${cookieOptions}`
  
  // Refresh Token (optional)
  if (tokens.refreshToken) {
    document.cookie = `refreshToken=${tokens.refreshToken}; ${cookieOptions}`
  }
  
  // User Info (encode as JSON)
  if (tokens.userInfo && Object.keys(tokens.userInfo).length > 0) {
    const userInfoEncoded = encodeURIComponent(JSON.stringify(tokens.userInfo))
    document.cookie = `userInfo=${userInfoEncoded}; ${cookieOptions}`
  }

  // Legacy authToken for backward compatibility
  document.cookie = `authToken=${tokens.accessToken}; ${cookieOptions}`
}

/**
 * Get a specific cookie value
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  
  return null
}

/**
 * Get access token from cookie
 */
export function getAccessToken(): string | null {
  return getCookie('accessToken') || getCookie('authToken')
}

/**
 * Get refresh token from cookie
 */
export function getRefreshToken(): string | null {
  return getCookie('refreshToken')
}

/**
 * Get user info from cookie
 */
export function getUserInfo(): UserInfo | null {
  const userInfoCookie = getCookie('userInfo')
  
  if (!userInfoCookie) return null
  
  try {
    const decoded = decodeURIComponent(userInfoCookie)
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Failed to parse user info from cookie:', error)
    return null
  }
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies(): void {
  const cookieOptions = 'path=/; max-age=0; SameSite=Lax'
  
  document.cookie = `accessToken=; ${cookieOptions}`
  document.cookie = `refreshToken=; ${cookieOptions}`
  document.cookie = `userInfo=; ${cookieOptions}`
  document.cookie = `authToken=; ${cookieOptions}`
}

/**
 * Set authentication data to localStorage
 */
export function setAuthLocalStorage(tokens: AuthTokens): void {
  localStorage.setItem('accessToken', tokens.accessToken)
  
  if (tokens.refreshToken) {
    localStorage.setItem('refreshToken', tokens.refreshToken)
  }
  
  if (tokens.userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(tokens.userInfo))
  }
}

/**
 * Get authentication data from localStorage
 */
export function getAuthLocalStorage(): AuthTokens | null {
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken')
  
  if (!accessToken) return null
  
  const refreshToken = localStorage.getItem('refreshToken') || undefined
  let userInfo: UserInfo | undefined
  
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      userInfo = JSON.parse(userInfoStr)
    }
  } catch (error) {
    console.error('Failed to parse user info from localStorage:', error)
  }
  
  return {
    accessToken,
    refreshToken,
    userInfo
  }
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthLocalStorage(): void {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('authToken') // legacy
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!getAccessToken() || !!localStorage.getItem('accessToken')
}

/**
 * Complete logout - clear everything
 */
export function logout(): void {
  clearAuthCookies()
  clearAuthLocalStorage()
}
