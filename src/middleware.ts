import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// ---- next-intl middleware (runs after our auth checks) ----
const intlMiddleware = createMiddleware(routing);

// Non-localized paths (no /en, /ar, etc.)
const PUBLIC_AUTH_PATHS = ["/login", "/forgot-password", "/password-reset"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Detect locale prefix (e.g., /en/dashboard -> locale="en", rest="/dashboard")
  const segments = pathname.split("/").filter(Boolean); // ["en","dashboard",...]
  const first = segments[0];
  const isLocale = routing.locales?.includes(first as any);
  const locale = isLocale ? first : undefined;

  const pathNoLocale =
    "/" + (isLocale ? segments.slice(1).join("/") : segments.join("/"));
  const token = request.cookies.get("token")?.value;

  const isAuthPage = PUBLIC_AUTH_PATHS.includes(pathNoLocale);
  const isDashboardRoute = pathNoLocale.startsWith("/dashboard");

  // Helper to prefix target with current locale if present
  const withLocale = (p: string) => (locale ? `/${locale}${p}` : p);

  // If authenticated and trying to access auth pages → redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(
      new URL(withLocale("/dashboard"), request.url)
    );
  }

  if (!token && isDashboardRoute) {
    const loginUrl = new URL(withLocale("/login"), request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Fall through to next-intl for locale routing/rewrites
  return intlMiddleware(request);
}

// Run on all routes except next assets & file requests (same as next-intl example)
export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
