import { NextRequest, NextResponse } from 'next/server'

// Unprotected routes
const publicRoutes = ['/login', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // If the route is public, allow access
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // If trying to access a protected route without token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Allow access to protected routes if authenticated
  return NextResponse.next()
}

// Apply middleware to all routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
