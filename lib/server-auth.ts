import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Server-side authentication check
 * Use this in Server Components or Server Actions
 */
export async function requireAuth(redirectTo: string = '/') {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const authToken = cookieStore.get('authToken')?.value
  
  const token = accessToken || authToken

  if (!token) {
    // User is not authenticated, redirect
    redirect(redirectTo)
  }

  return token
}

/**
 * Get authentication status on server
 */
export async function getServerAuth() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const authToken = cookieStore.get('authToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value
  
  // Try to parse user info
  let userInfo = null
  const userInfoCookie = cookieStore.get('userInfo')?.value
  
  if (userInfoCookie) {
    try {
      const decoded = decodeURIComponent(userInfoCookie)
      userInfo = JSON.parse(decoded)
    } catch (error) {
      console.error('Failed to parse user info from cookie:', error)
    }
  }

  return {
    isAuthenticated: !!(accessToken || authToken),
    accessToken: accessToken || authToken || null,
    refreshToken: refreshToken || null,
    userInfo
  }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticatedServer(): Promise<boolean> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const authToken = cookieStore.get('authToken')?.value
  
  return !!(accessToken || authToken)
}
