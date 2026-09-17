import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionary';
import { ReviewBanner } from '@/components/public/ReviewBanner';

export const metadata: Metadata = { title: 'About' };

/**
 * NEEDS_REVIEW. Deliberately almost empty.
 *
 * An About page is the one part of a personal site that cannot be
 * ghostwritten: every fact invented about a career is a fabrication, and
 * every phrase chosen for a philosophy is someone else's reading of it.
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return (
    <div className="container stack">
      <ReviewBanner show label={dict.review.banner} />
      <h1>{dict.nav.about}</h1>
      <p className="prose" style={{ color: 'var(--fg-muted)' }}>{dict.about.placeholder}</p>
    </div>
  );
}
