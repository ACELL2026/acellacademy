/**
 * THE SCHEDULING TRAP.
 *
 * Phase 6 put `publish_at <= now()` in the RLS policy so a scheduled
 * announcement appears on time with no cron job. Correct — for a DYNAMIC
 * page. On a STATIC page the query runs at BUILD time, so `now()` is
 * frozen. An announcement scheduled for next Tuesday is simply absent,
 * and stays absent until something else triggers a rebuild. The RLS
 * guarantee is intact and completely inert.
 *
 * FIX: prerender future items WITH their publish instant but WITHOUT
 * their body, so the client can reveal them on time and nothing
 * embargoed ever reaches the browser.
 */

export interface AnnouncementSeed {
  id: string;
  slug: string;
  title: string;
  body: string;
  publishAt: string;
  linkHref: string | null;
  locale: 'en' | 'ar';
}

export interface PreparedAnnouncement {
  id: string;
  slug: string;
  publishAt: string;
  title: string | null;
  body: string | null;
  linkHref: string | null;
  scheduled: boolean;
}

export function prepareForStatic(
  items: AnnouncementSeed[],
  buildNow = Date.now()
): PreparedAnnouncement[] {
  return items
    .slice()
    .sort((a, b) => Date.parse(b.publishAt) - Date.parse(a.publishAt))
    .map((a) => {
      const due = Date.parse(a.publishAt) <= buildNow;
      return {
        id: a.id,
        slug: a.slug,
        publishAt: a.publishAt,
        title: due ? a.title : null,
        body: due ? a.body : null,
        linkHref: due ? a.linkHref : null,
        scheduled: !due,
      };
    });
}

export const visibleNow = (items: PreparedAnnouncement[], nowMs: number) =>
  items.filter((a) => Date.parse(a.publishAt) <= nowMs && a.title !== null);

export const pendingReveal = (items: PreparedAnnouncement[], nowMs: number) =>
  items.filter((a) => a.scheduled && Date.parse(a.publishAt) <= nowMs);
