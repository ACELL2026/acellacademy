import type { AnnouncementSeed } from '@/lib/public/announcements';

/** Structural examples proving the scheduling path works, not finished copy. */
export const ANNOUNCEMENTS: AnnouncementSeed[] = [
  { id: 'a1', slug: 'site-launch', title: 'ACELL Academy is open',
    body: 'Books, courses and consultancy, now in one place.',
    publishAt: '2026-09-17T08:00:00Z', linkHref: null, locale: 'en' },
  { id: 'a1-ar', slug: 'site-launch', title: 'أكاديمية أسيل مفتوحة الآن',
    body: 'الكتب والدورات والاستشارات، في مكان واحد.',
    publishAt: '2026-09-17T08:00:00Z', linkHref: null, locale: 'ar' },
];
