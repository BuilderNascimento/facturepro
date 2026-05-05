import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { isSubscriptionActive } from '@/lib/stripe';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const protectedPaths = ['/dashboard', '/clients', '/services', '/invoices', '/settings', '/properties'];
const publicPaths = ['/', '/register', '/login', '/subscribe', '/payment-success', '/billing-issue', '/confirmar-email', '/privacidade', '/termos'];

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

  // Rotas de API do Stripe — nunca bloquear
  if (pathname.startsWith('/api/stripe/')) {
    return NextResponse.next();
  }

  // Rotas públicas — deixa passar
  if (publicPaths.includes(pathname) || (!isProtected(pathname) && pathname !== '/login')) {
    return NextResponse.next();
  }

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

    // Não logado → login
    if (!user && isProtected(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Logado + rota de login → dashboard
    if (user && pathname === '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Logado + rota protegida → verificar assinatura
    if (user && isProtected(pathname)) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle();

      const isActive = sub
        ? isSubscriptionActive(String(sub.status ?? ''), sub.current_period_end ?? null)
        : false;

      if (!isActive) {
        const url = request.nextUrl.clone();
        // past_due gets a friendlier screen
        url.pathname = sub?.status === 'past_due' ? '/billing-issue' : '/subscribe';
        return NextResponse.redirect(url);
      }
    }

    return response;
  } catch {
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
