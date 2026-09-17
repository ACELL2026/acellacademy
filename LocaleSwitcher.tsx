'use client';
import { usePathname, useRouter } from 'next/navigation';
import { LOCALE_COOKIE, type Locale } from '@/lib/i18n/config';

export function LocaleSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const next: Locale = current === 'en' ? 'ar' : 'en';

  function switchTo(l: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    const rest = pathname.replace(/^\/(en|ar)/, '') || '';
    router.push(`/${l}${rest}`);
    router.refresh();
  }

  return (
    <button type="button" className="locale-btn" lang={next}
      aria-label={`${label}: ${next === 'ar' ? 'العربية' : 'English'}`}
      onClick={() => switchTo(next)}>
      {next === 'ar' ? 'العربية' : 'English'}
    </button>
  );
}
