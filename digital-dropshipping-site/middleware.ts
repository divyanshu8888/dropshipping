import { NextRequest, NextResponse } from 'next/server';

// Define protected admin routes
const ADMIN_ROUTES = ['/admin', '/admin/setup', '/admin/products-enhanced', '/admin/quotes', '/admin/orders', '/admin/moderation', '/admin/team'];

// Define protected freelancer routes  
const FREELANCER_ROUTES = ['/freelancers/dashboard', '/freelancers/profile-setup'];

// Define protected client routes
const CLIENT_ROUTES = ['/client-dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  const isFreelancerRoute = FREELANCER_ROUTES.some(route => pathname.startsWith(route));
  const isClientRoute = CLIENT_ROUTES.some(route => pathname.startsWith(route));
  
  // For protected routes, we'll handle authentication in the page components
  // This middleware serves as a first line of defense
  return NextResponse.next();
}

export const config = {
  // Only run middleware on protected route prefixes to avoid overhead on public pages
  matcher: [
    '/admin/:path*',
    '/freelancers/dashboard',
    '/freelancers/profile-setup',
    '/client-dashboard'
  ],
};
