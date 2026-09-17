import { NextResponse, type NextRequest } from 'next/server';
import { LOCALES, LOCALE_COOKIE, negotiate, type Locale } from '@/lib/i18n/config';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') ||
      pathname === '/favicon.ico' || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  if (!hasLocale) {
    const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value as Locale | undefined;
    const locale = cookieLocale && LOCALES.includes(cookieLocale)
      ? cookieLocale
      : negotiate(req.headers.get('accept-language'));
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    // 307: negotiated per-user, never cacheable as permanent
    return NextResponse.redirect(url, 307);
  }

  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), publickey-credentials-get=(self)');
  return res;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
