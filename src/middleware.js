import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  
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

  // Log for debugging
  console.log('Middleware - Path:', req.nextUrl.pathname);
  console.log('Middleware - Session exists:', !!session);
  console.log('Middleware - Session user:', session?.user?.id);

  // If no session and user is trying to access /app, redirect to /login
  if (!session && req.nextUrl.pathname.startsWith('/app')) {
    console.log('Middleware - Redirecting to /login (no session)');
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If there IS a session and user is on /login, redirect to /app
  if (session && req.nextUrl.pathname === '/login') {
    console.log('Middleware - Redirecting to /app (has session)');
    const url = req.nextUrl.clone();
    url.pathname = '/app';
    return NextResponse.redirect(url);
  }

  return res;
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};