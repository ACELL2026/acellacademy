/** Money is stored in MINOR units with its ISO 4217 exponent.
 *  LYD exponent = 3 (1 LYD = 1000 dirham). Never assume 2 decimals. */
export type CurrencyCode = 'LYD' | 'USD' | 'GBP' | 'EUR';

export interface Money {
  amount_minor: number;
  currency: CurrencyCode;
  currency_exp: number;
}

export const CURRENCY_EXP: Record<CurrencyCode, number> = { LYD: 3, USD: 2, GBP: 2, EUR: 2 };
export const LYD_SHIPPING_FLAT_MINOR = 20_000; // 20.000 LYD

export const toMajor = (m: Money) => m.amount_minor / 10 ** m.currency_exp;

export function fromMajor(major: number, currency: CurrencyCode): Money {
  const exp = CURRENCY_EXP[currency];
  return { amount_minor: Math.round(major * 10 ** exp), currency, currency_exp: exp };
}

export function formatMoney(m: Money, locale: 'en' | 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-LY' : 'en-LY', {
    style: 'currency',
    currency: m.currency,
    minimumFractionDigits: m.currency_exp,
    maximumFractionDigits: m.currency_exp,
  }).format(toMajor(m));
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new Error(`Currency mismatch: ${a.currency} + ${b.currency}`);
  return { ...a, amount_minor: a.amount_minor + b.amount_minor };
}
