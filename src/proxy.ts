import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const protectedPaths = ['/dashboard', '/clients', '/services', '/invoices', '/settings', '/properties'];
const publicPaths = ['/', '/register', '/login'];

function isProtected(pathname: string) {
  return protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Modo demo — usa cookie simples
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

  // Rotas públicas — deixa passar sem verificar Supabase
  if (!isProtected(pathname) && !publicPaths.includes(pathname)) {
    return NextResponse.next();
  }
  if (pathname === '/register') return NextResponse.next();

  // Sem credenciais configuradas — redirecionar para login
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (isProtected(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  try {
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
  } catch {
    // Se Supabase falhar, redirecionar para login em rotas protegidas
    if (isProtected(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
