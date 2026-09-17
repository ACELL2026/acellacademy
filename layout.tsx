import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { LOCALES, dirOf, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionary';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SkipLink } from '@/components/layout/SkipLink';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: Locale }> }
): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: { default: dict.brand.name, template: `%s · ${dict.brand.name}` },
    description: dict.brand.tagline,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', ar: '/ar', 'x-default': '/en' },
    },
    openGraph: {
      title: dict.brand.name,
      description: dict.brand.tagline,
      locale: locale === 'ar' ? 'ar_LY' : 'en_GB',
      type: 'website',
    },
  };
}

export default async function LocaleLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  if (!LOCALES.includes(locale)) notFound();
  const dict = await getDictionary(locale);

  // lang/dir set here so Arabic mirrors via logical properties — one stylesheet
  return (
    <div lang={locale} dir={dirOf(locale)}>
      <SkipLink label={dict.nav.skipToContent} />
      <Header locale={locale} dict={dict} />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer locale={locale} dict={dict} />
    </div>
  );
}
