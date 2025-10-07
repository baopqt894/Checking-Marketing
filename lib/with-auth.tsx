'use client'

import { useEffect, ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

/**
 * Higher Order Component (HOC) to protect pages
 * Usage: export default withAuth(YourPageComponent)
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  redirectTo: string = '/'
) {
  return function ProtectedPage(props: P) {
    const router = useRouter()

    useEffect(() => {
      // Check authentication on mount
      if (!isAuthenticated()) {
        console.log('[withAuth] User not authenticated, redirecting...')
        router.push(redirectTo)
      }
    }, [router])

    // Show loading while checking or redirecting
    if (!isAuthenticated()) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying access...</p>
          </div>
        </div>
      )
    }

    // Render the protected component
    return <Component {...props} />
  }
}

/**
 * Hook to check authentication and redirect if needed
 * Usage in any component: useRequireAuth()
 */
export function useRequireAuth(redirectTo: string = '/') {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('[useRequireAuth] User not authenticated, redirecting...')
      router.push(redirectTo)
    }
  }, [router, redirectTo])

  return isAuthenticated()
}
