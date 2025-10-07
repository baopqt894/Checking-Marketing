'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // Client-side authentication check
    if (!isAuthenticated()) {
      console.log('[Dashboard Template] User not authenticated, redirecting to login')
      router.push('/')
    }
  }, [router])

  // If not authenticated, show loading state
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

  return <>{children}</>
}
