import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const href = (p: string) => `/${locale}${p}`;
  return (
    <footer className="site-footer">
      <div className="container">
        <hr className="decor-rule" />
        <nav aria-label={dict.a11y.footerNav} className="site-footer__grid">
          <div>
            <h2 className="site-footer__heading">{dict.footer.explore}</h2>
            <ul>
              <li><Link href={href('/books')}>{dict.nav.books}</Link></li>
              <li><Link href={href('/courses')}>{dict.nav.courses}</Link></li>
              <li><Link href={href('/articles')}>{dict.nav.articles}</Link></li>
              <li><Link href={href('/consultancy')}>{dict.nav.consultancy}</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="site-footer__heading">{dict.footer.legal}</h2>
            <ul>
              <li><Link href={href('/refunds')}>{dict.footer.refunds}</Link></li>
              <li><Link href={href('/contact')}>{dict.nav.contact}</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="site-footer__heading">{dict.footer.newsletter}</h2>
            <p style={{ fontSize: '.9rem', color: 'var(--fg-muted)' }}>{dict.footer.newsletterBlurb}</p>
          </div>
        </nav>
        <p className="site-footer__legal">
          © {new Date().getFullYear()} {dict.brand.author}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
