export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const RTL_LOCALES: Locale[] = ['ar'];
export const isRtl = (l: Locale) => RTL_LOCALES.includes(l);
export const dirOf = (l: Locale): 'rtl' | 'ltr' => (isRtl(l) ? 'rtl' : 'ltr');
export const LOCALE_COOKIE = 'yma_locale';

export function negotiate(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'en';
  const ranked = acceptLanguage.split(',').map((p) => {
    const [tag, q] = p.trim().split(';q=');
    return { tag: tag.toLowerCase(), q: q ? parseFloat(q) : 1 };
  }).sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    if (tag.startsWith('ar')) return 'ar';
    if (tag.startsWith('en')) return 'en';
  }
  return 'en';
}
