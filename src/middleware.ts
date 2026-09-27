import { NextRequest, NextResponse } from "next/server";
import {
  isPublicRoute,
  getLoginRedirect,
  getPostLoginRedirect,
  ROUTES,
} from "./utils/constants/NavigationRoutes";
import { ACCESS_TOKEN_NAME } from "./utils/constants/enums";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_TOKEN_NAME)?.value;

  // Authenticated user
  if (accessToken) {
    // Redirect from auth pages (signin, signup, etc.) to dashboard — except
    // accept-invite: an already-signed-in admin may be opening an invite
    // link for a *different* account (e.g. an invitee who is also an admin
    // elsewhere), so let the page load and decide instead of bouncing them.
    if (isPublicRoute(pathname) && pathname !== ROUTES.ACCEPT_INVITE) {
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
