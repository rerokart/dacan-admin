import { NextRequest, NextResponse } from "next/server";
import {
  isPublicRoute,
  getLoginRedirect,
  getPostLoginRedirect,
} from "./utils/constants/NavigationRoutes";
import { ACCESS_TOKEN_NAME } from "./utils/constants/enums";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_TOKEN_NAME)?.value;

  // Authenticated user
  if (accessToken) {
    // Redirect from auth pages (signin, signup, etc.) to dashboard
    if (isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL(getPostLoginRedirect(), request.url));
    }
    return NextResponse.next();
  }

  // Unauthenticated user - allow access to public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Redirect to login for protected routes
  return NextResponse.redirect(new URL(getLoginRedirect(), request.url));
}

export const config = {
  // Exclude API routes, Next internals, and any file with an extension
  // (e.g. /logo.jpeg, /images/*.png) so public static assets bypass auth
  // and the image optimizer can fetch them.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)"],
};
