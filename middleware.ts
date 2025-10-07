import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || path === '/login'

  // Get the token from cookies - check both accessToken and legacy authToken
  const accessToken = request.cookies.get('accessToken')?.value || ''
  const authToken = request.cookies.get('authToken')?.value || ''
  const token = accessToken || authToken

  // Redirect logic
  if (!isPublicPath && !token) {
    // User is not authenticated and trying to access protected route
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isPublicPath && token && path !== '/') {
    // User is authenticated and trying to access login page
    return NextResponse.redirect(new URL('/dashboard/app-performance', request.url))
  }

  return NextResponse.next()
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.webp$).*)',
  ],
}
