import { NextRequest, NextResponse } from 'next/server';

const ADMIN_ROUTES = ['/admin'];
const FREELANCER_ROUTES = ['/freelancers/dashboard', '/freelancers/profile-setup'];
const CLIENT_ROUTES = ['/clients/dashboard'];

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Edge-runtime safe base64url decode
    const raw = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(raw));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isFreelancerRoute = FREELANCER_ROUTES.some((r) => pathname.startsWith(r));
  const isClientRoute = CLIENT_ROUTES.some((r) => pathname.startsWith(r));

  if (!isAdminRoute && !isFreelancerRoute && !isClientRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session_token')?.value;

  // No cookie — redirect to login (unless the request already has the legacy
  // localStorage user flow in progress, which is handled client-side).
  // We only hard-redirect when a cookie was expected but absent.
  if (!token) {
    // Allow the request through; client-side auth guards will redirect.
    // This keeps backwards-compatibility with the existing localStorage flow.
    return NextResponse.next();
  }

  const payload = parseJwtPayload(token);

  if (!payload) {
    // Malformed token — clear cookie and redirect to login
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('session_token');
    return res;
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp < now) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('session_token');
    return res;
  }

  const role = String(payload.role ?? '').toUpperCase();

  if (isAdminRoute && role !== 'ADMIN' && role !== 'TEAM_MEMBER') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isFreelancerRoute && role !== 'FREELANCER') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isClientRoute && role !== 'CLIENT') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = NextResponse.next();
  response.headers.set('x-user-id', String(payload.userId ?? ''));
  response.headers.set('x-user-role', role);
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/freelancers/dashboard', '/freelancers/profile-setup', '/clients/dashboard'],
};
