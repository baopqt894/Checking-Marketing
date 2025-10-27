import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicPath = path === '/' || path === '/login'

  const accessToken = request.cookies.get('accessToken')?.value || ''
  const authToken = request.cookies.get('authToken')?.value || ''
  const token = accessToken || authToken

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard/app-performance', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
}
