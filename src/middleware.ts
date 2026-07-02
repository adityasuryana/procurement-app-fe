import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value

  // If trying to access dashboard and not logged in, redirect to /portal
  if (!isLoggedIn && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  // If logged in and trying to go to /portal, redirect to /dashboard
  if (isLoggedIn && request.nextUrl.pathname === '/portal') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/portal'],
}
