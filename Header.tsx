import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { ThemeToggle } from './ThemeToggle';
import { LocaleSwitcher } from './LocaleSwitcher';

const NAV = [
  ['books', '/books'], ['courses', '/courses'], ['announcements', '/announcements'],
  ['consultancy', '/consultancy'], ['articles', '/articles'], ['about', '/about'],
] as const;

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const href = (p: string) => `/${locale}${p}`;
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href={href('')} className="brand" aria-label={dict.brand.name}>
          <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
            <path d="M16 3.5 18.4 13.6 28.5 16 18.4 18.4 16 28.5 13.6 18.4 3.5 16 13.6 13.6Z" fill="currentColor" opacity=".9" />
          </svg>
          <span>{dict.brand.name}</span>
        </Link>
        <nav className="site-nav" aria-label={dict.a11y.mainNav}>
          <ul className="site-nav__list">
            {NAV.map(([key, path]) => (
              <li key={path}><Link href={href(path)}>{dict.nav[key]}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="site-header__actions">
          <LocaleSwitcher current={locale} label={dict.locale.label} />
          <ThemeToggle label={dict.theme.toggle} />
        </div>
      </div>
    </header>
  );
}
