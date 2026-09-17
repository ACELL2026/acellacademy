import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';

/**
 * Refund terms on EVERY course and service page — not only at checkout.
 * A policy discovered at checkout is a policy argued about after the sale,
 * and in most consumer regimes terms surfaced after payment are
 * unenforceable anyway.
 *
 * The practitioner-cancellation line is emphasised because it is the one
 * unconditional obligation, and the one a customer most needs to see
 * before committing money by a bank transfer they cannot reverse.
 */
export function RefundNote({
  kind, locale, dict,
}: { kind: 'course' | 'booking' | 'physical'; locale: Locale; dict: Dictionary }) {
  const keys = kind === 'course'
    ? ['fullRefundBefore', 'creditWithin', 'noneAfterStart', 'weCancelFullRefund']
    : kind === 'booking'
    ? ['fullRefundNotice', 'lateBecomesCredit', 'creditValidity', 'weCancelFullRefund']
    : ['noChangeOfMind', 'faultyReplaced'];

  return (
    <section className="refund-note" aria-labelledby={`refund-${kind}`}>
      <h2 id={`refund-${kind}`} className="refund-note__heading">{dict.refund.heading}</h2>
      <ul className="refund-note__list">
        {keys.map((k) => {
          const emphasis = k === 'weCancelFullRefund';
          return (
            <li key={k} className={emphasis ? 'refund-note__item refund-note__item--emphasis' : 'refund-note__item'}>
              {dict.flat[`policy.${kind}.${k}`]}
            </li>
          );
        })}
      </ul>
      <p style={{ fontSize: '.88rem', marginBlockStart: 'var(--s-2)' }}>
        <a href={`/${locale}/refunds`}>{dict.refund.fullPolicy}</a>
      </p>
    </section>
  );
}
