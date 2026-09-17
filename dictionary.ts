import 'server-only';
import type { Locale } from './config';
import en from './en.json';
import ar from './ar.json';

export type Dictionary = typeof en & { flat: Record<string, string> };

/** Flattens nested keys to "a.b.c" so client components take a plain map. */
function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else if (v && typeof v === 'object') Object.assign(out, flatten(v as Record<string, unknown>, key));
  }
  return out;
}

const dicts = { en, ar } as const;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const base = dicts[locale] ?? dicts.en;
  return { ...base, flat: flatten(base) } as Dictionary;
}
