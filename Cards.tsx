import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { formatMoney } from '@/lib/money';
import type { SeedBook } from '@/content/seed';

/**
 * Catalogue card — fully static.
 *
 * Content status (published / coming_soon) IS safe to prerender: it only
 * changes when the author edits an entry, which rebuilds anyway. Course
 * and service status are NOT safe and never appear here.
 */
export function BookCard({ book, locale, dict }: { book: SeedBook; locale: Locale; dict: Dictionary }) {
  const comingSoon = book.status === 'coming_soon';
  return (
    <article className="card">
      {book.level && <p className="eyebrow">{book.level}</p>}
      <h2 className="card__title">
        {/* No link when coming soon: there is no body to read yet. */}
        {comingSoon ? <span>{book.title}</span> : <a href={`/${locale}/books/${book.slug}`}>{book.title}</a>}
      </h2>
      {comingSoon && (
        <span className="badge" style={{ color: 'var(--fn-copper)', borderColor: 'var(--fn-copper)' }}>
          {dict.status.comingSoon}
        </span>
      )}
      <p className="card__description">{book.description}</p>
      {book.amountMinor !== null && !comingSoon && (
        <p className="card__price">
          {formatMoney({ amount_minor: book.amountMinor, currency: 'LYD', currency_exp: 3 }, locale)}
        </p>
      )}
    </article>
  );
}
