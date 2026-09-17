'use client';
import { useEffect, useState } from 'react';
import {
  type StatusPayload, type CourseStatus, type ServiceStatus,
  clockOffsetMs, correctedNow, remaining,
} from '@/lib/public/volatile';

/**
 * Hydrates the volatile half of a static page.
 *
 * Failure behaviour matters more than success behaviour: if the fetch
 * fails the placeholder stays, and the placeholder is never a
 * transaction — only a link. Otherwise a JS failure would invite someone
 * to pay for a full or finished cohort.
 */
interface Ctx { payload: StatusPayload | null; offsetMs: number; failed: boolean }
let cache: Ctx | null = null;
let inflight: Promise<Ctx> | null = null;

async function loadStatus(): Promise<Ctx> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch('/api/status', { headers: { accept: 'application/json' } })
    .then(async (res) => {
      if (!res.ok) throw new Error(String(res.status));
      const payload = (await res.json()) as StatusPayload;
      cache = { payload, offsetMs: clockOffsetMs(payload.now), failed: false };
      return cache;
    })
    .catch(() => ({ payload: null, offsetMs: 0, failed: true }))
    .finally(() => { inflight = null; });
  return inflight;
}

function useStatus() {
  const [ctx, setCtx] = useState<Ctx | null>(cache);
  useEffect(() => {
    let alive = true;
    loadStatus().then((c) => { if (alive) setCtx(c); });
    return () => { alive = false; };
  }, []);
  return ctx;
}

const BADGE_TOKEN: Record<string, string> = {
  available: 'var(--fn-teal)', enrollment_open: 'var(--fn-teal)', in_progress: 'var(--fn-teal)',
  limited: 'var(--fn-copper)', coming_soon: 'var(--fn-copper)',
  announced: 'var(--fn-copper)', closing_soon: 'var(--fn-copper)',
  full: 'var(--fn-grey)', fully_booked: 'var(--fn-grey)',
  completed: 'var(--fn-grey)', archived: 'var(--fn-grey)', draft: 'var(--fn-rose)',
};

export function StatusBadge({ badge, label, pending }: { badge: string | null; label: string; pending?: boolean }) {
  const color = badge ? (BADGE_TOKEN[badge] ?? 'var(--fn-grey)') : 'var(--fn-grey)';
  return (
    <span className={`badge${pending ? ' badge--pending' : ''}`}
      style={{ color, borderColor: color }} aria-live="polite">{label}</span>
  );
}

/** Ticks against SERVER time. A device two hours fast would otherwise show
 *  4h remaining on a 6h payment deadline — a lost order and a support call. */
export function Countdown({ targetIso, offsetMs, labels }: {
  targetIso: string; offsetMs: number;
  labels: { days: string; hours: string; minutes: string; expired: string };
}) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const r = remaining(targetIso, correctedNow(offsetMs));
  if (r.expired) return <span className="countdown">{labels.expired}</span>;
  const parts = r.days > 0
    ? [`${r.days}${labels.days}`, `${r.hours}${labels.hours}`]
    : [`${r.hours}${labels.hours}`, `${r.minutes}${labels.minutes}`];
  return <span className="countdown">{parts.join(' ')}</span>;
}

export function CourseCta({ courseId, href, dict }: {
  courseId: string; href: string; dict: Record<string, string>;
}) {
  const ctx = useStatus();
  const status: CourseStatus | undefined = ctx?.payload?.courses.find((c) => c.id === courseId);

  if (!ctx || ctx.failed || !status) {
    return (
      <div className="cta-row">
        <StatusBadge badge={null} label={dict['status.checking']} pending />
        <a className="btn btn--ghost" href={href}>{dict['cta.viewDetails']}</a>
      </div>
    );
  }
  return (
    <div className="cta-row">
      <StatusBadge badge={status.badge} label={dict[`status.${status.badge}`] ?? status.badge} />
      {status.seatSignal === 'few_left' && !status.canJoinWaitlist && (
        <span className="seat-signal">{dict['seats.fewLeft']}</span>
      )}
      {status.countdownTo && (
        <Countdown targetIso={status.countdownTo} offsetMs={ctx.offsetMs}
          labels={{ days: dict['time.d'], hours: dict['time.h'], minutes: dict['time.m'], expired: dict['time.closed'] }} />
      )}
      {status.canEnrol && <a className="btn btn--primary" href={`${href}#enrol`}>{dict['cta.enrol']}</a>}
      {status.canJoinWaitlist && <a className="btn btn--ghost" href={`${href}#waitlist`}>{dict['cta.joinWaitlist']}</a>}
      {status.canRegisterInterest && <a className="btn btn--ghost" href={`${href}#interest`}>{dict['cta.registerInterest']}</a>}
    </div>
  );
}

export function ServiceCta({ serviceId, href, dict }: {
  serviceId: string; href: string; dict: Record<string, string>;
}) {
  const ctx = useStatus();
  const status: ServiceStatus | undefined = ctx?.payload?.services.find((s) => s.id === serviceId);

  if (!ctx || ctx.failed || !status) {
    return (
      <div className="cta-row">
        <StatusBadge badge={null} label={dict['status.checking']} pending />
        <a className="btn btn--ghost" href={href}>{dict['cta.viewDetails']}</a>
      </div>
    );
  }
  return (
    <div className="cta-row">
      <StatusBadge badge={status.badge} label={dict[`status.${status.badge}`] ?? status.badge} />
      {status.canBook && <a className="btn btn--primary" href={`${href}#book`}>{dict['cta.book']}</a>}
      {status.canEnquire && <a className="btn btn--ghost" href={`${href}#enquire`}>{dict['cta.enquire']}</a>}
      {status.canJoinWaitlist && <a className="btn btn--ghost" href={`${href}#waitlist`}>{dict['cta.joinWaitlist']}</a>}
    </div>
  );
}
