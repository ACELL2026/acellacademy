'use client';
import { useEffect, useState } from 'react';
import { THEME_COOKIE } from '@/lib/theme/theme-script';

export function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    setTheme((document.documentElement.getAttribute('data-theme') as 'light' | 'dark') ?? 'light');
  }, []);

  function apply(next: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.style.colorScheme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    setTheme(next);
  }

  const isDark = theme === 'dark';
  return (
    <button type="button" className="icon-btn" aria-label={label} aria-pressed={isDark}
      onClick={() => apply(isDark ? 'light' : 'dark')}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {isDark
          ? <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          : <><circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.1 5.1l1.4 1.4M17.5 17.5l1.4 1.4M18.9 5.1l-1.4 1.4M6.5 17.5l-1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>}
      </svg>
    </button>
  );
}
