import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // Skip middleware for static files, API routes, and auth callback
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.includes('.') ||
    req.nextUrl.pathname.includes('auth/callback')
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  
  try {
    // Create Supabase client for server-side
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name) => req.cookies.get(name)?.value,
          set: (name, value, options) => {
            res.cookies.set(name, value, options);
          },
          remove: (name, options) => {
            res.cookies.set(name, '', { ...options, maxAge: 0 });
          },
        },
      }
    );

    // Get session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Middleware auth error:', error);
      return res;
    }

    const isAuthPage = req.nextUrl.pathname === '/login';
    const isAppPage = req.nextUrl.pathname.startsWith('/app');
    const isHomePage = req.nextUrl.pathname === '/';

    console.log('Middleware check:', {
      path: req.nextUrl.pathname,
      hasSession: !!session,
      isAuthPage,
      isAppPage
    });

    // If no session and trying to access protected routes, redirect to login
    if (!session && isAppPage) {
      console.log('No session, redirecting to login');
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    // If has session and on login page, redirect to app
    if (session && isAuthPage) {
      console.log('Has session on login page, redirecting to app');
      const appUrl = new URL('/app', req.url);
      return NextResponse.redirect(appUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (Supabase auth callback)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
};