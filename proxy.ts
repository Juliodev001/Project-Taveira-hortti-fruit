import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'
import { cookies } from 'next/headers'

const publicRoutes = ['/login', '/api/auth/logout']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isPublic = publicRoutes.some((r) => path.startsWith(r))

  const cookieStore = await cookies()
  const session = await decrypt(cookieStore.get('session')?.value)

  if (!isPublic && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (path === '/login' && session?.userId) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
