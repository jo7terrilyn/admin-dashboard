import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This is a simple middleware to handle authentication
// In a real application, you would verify tokens, sessions, etc.
export function middleware(request: NextRequest) {
  // Skip auth check for source-montgomery path
  if (request.nextUrl.pathname.startsWith('/source-montgomery')) {
    return NextResponse.next()
  }

  const isAuthenticated = request.cookies.get("isAuthenticated")?.value === "true"
  const isSignInPage = request.nextUrl.pathname === "/sign-in"

  if (!isAuthenticated && !isSignInPage) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (isAuthenticated && isSignInPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|source-montgomery).*)"],
}
