import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const protectedPaths = ['/dashboard', '/clients', '/services', '/invoices', '/settings', '/properties'];

function isProtected(pathname: string) {
  return protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (IS_DEMO) {
    const hasAuth = request.cookies.has('demo_auth');
    if (isProtected(pathname) && !hasAuth) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    if (pathname === '/login' && hasAuth) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Modo produção – Supabase Auth
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
