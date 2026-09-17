'use client';
import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n/config';
import { type PreparedAnnouncement, visibleNow, pendingReveal } from '@/lib/public/announcements';

/**
 * Reveals scheduled announcements without a rebuild.
 *
 * Items already due at build time are fully present in the HTML and
 * render with JavaScript off. Items that became due afterwards show a
 * dated marker and link through — their body was never embedded, so the
 * embargo held.
 */
export function AnnouncementFeed({ items, locale, dict }: {
  items: PreparedAnnouncement[];
  locale: Locale;
  dict: { empty: string; newlyPublished: string; readIt: string; more: string };
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/status').then((r) => r.json())
      .then((p) => setNow(Date.parse(p.now)))
      .catch(() => setNow(Date.now()));
  }, []);

  const live = visibleNow(items, now ?? Date.now());
  const revealed = now ? pendingReveal(items, now) : [];
  const fmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-LY' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' });

  if (!live.length && !revealed.length) {
    return <p className="prose" style={{ color: 'var(--fg-muted)' }}>{dict.empty}</p>;
  }

  return (
    <ol className="announcement-feed">
      {revealed.map((a) => (
        <li key={a.id} className="announcement">
          <time dateTime={a.publishAt} className="announcement__date">{fmt.format(Date.parse(a.publishAt))}</time>
          <h2 className="announcement__title">{dict.newlyPublished}</h2>
          <p><a href={`/${locale}/announcements`}>{dict.readIt}</a></p>
        </li>
      ))}
      {live.map((a) => (
        <li key={a.id} className="announcement">
          <time dateTime={a.publishAt} className="announcement__date">{fmt.format(Date.parse(a.publishAt))}</time>
          <h2 className="announcement__title">{a.title}</h2>
          {a.body && <p>{a.body}</p>}
          {a.linkHref && <p><a href={a.linkHref}>{dict.more}</a></p>}
        </li>
      ))}
    </ol>
  );
}
