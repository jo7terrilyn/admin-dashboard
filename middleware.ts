import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This is a simple middleware to handle authentication
// In a real application, you would verify tokens, sessions, etc.
export function middleware(request: NextRequest) {
  // For this demo, we'll disable the middleware to allow direct access to all routes
  return NextResponse.next()

  // In a real application, you would use code like this:
  /*
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/sign-in" || path === "/sign-up" || path === "/forgot-password"

  // Get authentication status from cookies
  // In a real app, you would verify the token/session
  const isAuthenticated = request.cookies.has("auth-token")

  // Redirect logic
  if (!isPublicPath && !isAuthenticated) {
    // Redirect to login if trying to access protected route without auth
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (isPublicPath && isAuthenticated && path !== "/forgot-password") {
    // Redirect to dashboard if already authenticated
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
  */
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
