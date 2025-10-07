'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

/**
 * AuthGuard component - Protects routes by checking authentication
 * Redirects to login page if user is not authenticated
 */
export function AuthGuard({ children, redirectTo = '/' }: AuthGuardProps) {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // User is not authenticated, redirect to login
      console.log('[AuthGuard] User not authenticated, redirecting to login')
      router.push(redirectTo)
    }
  }, [router, redirectTo])

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // User is authenticated, render children
  return <>{children}</>
}
