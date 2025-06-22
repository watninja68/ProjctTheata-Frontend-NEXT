import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => res.cookies.set(name, value, options),
        remove: (name, options) => res.cookies.set(name, '', options),
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // If no session and user is trying to access /app, redirect to /login
  if (!session && req.nextUrl.pathname.startsWith('/app')) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If there IS a session and user is on /login, redirect to /app
  if (session && req.nextUrl.pathname === '/login') {
      const url = req.nextUrl.clone();
      url.pathname = '/app';
      return NextResponse.redirect(url);
  }

  return res;
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/app/:path*', '/login'],
};
