/**
 * Static shell + volatile hydration.
 *
 * PHASE 6 AND PHASE 8 CONTRADICT EACH OTHER, AND THIS FILE IS THE FIX.
 *
 *   Phase 6: course status is DERIVED at read time, so it cannot go stale.
 *   Phase 8: every public page is STATIC, to stay inside the 10ms CPU ceiling.
 *
 * A statically generated page bakes the derived status into HTML at BUILD
 * time, so "never stale" silently becomes "always stale": a full cohort
 * still reads "Enrolment open", a passed deadline still shows an Enrol
 * button, and the countdown is frozen at the build timestamp.
 *
 * Rebuilding on every seat change is not viable — 500 builds/month is
 * roughly 16 per day, with 1 concurrent build.
 *
 * RESOLUTION: split every page by volatility. Static fields prerender;
 * volatile fields hydrate from /api/status (JSON only, no React render).
 */

export const STATIC_FIELDS = [
  'title', 'description', 'body_md', 'cover_url', 'level', 'tags',
  'price', 'currency', 'format', 'timezone', 'schedule', 'units',
  'refund_policy', 'seo', 'translations',
] as const;

export const VOLATILE_FIELDS = [
  'badge', 'seat_signal', 'can_enrol', 'can_join_waitlist',
  'can_register_interest', 'countdown_to', 'can_book', 'can_enquire',
] as const;

export const isVolatile = (field: string): boolean =>
  (VOLATILE_FIELDS as readonly string[]).includes(field);

/** Fails the BUILD if a volatile field is prerendered. */
export function assertPrerenderable(fields: string[]): void {
  const leaked = fields.filter(isVolatile);
  if (leaked.length) {
    throw new Error(
      `Cannot prerender volatile field(s): ${leaked.join(', ')}. ` +
      `These change after build time and must hydrate from /api/status. ` +
      `See lib/public/volatile.ts`
    );
  }
}

export type CourseBadge =
  | 'draft' | 'announced' | 'enrollment_open' | 'closing_soon'
  | 'full' | 'in_progress' | 'completed' | 'archived';

export type ServiceBadge =
  | 'draft' | 'coming_soon' | 'available' | 'limited' | 'fully_booked' | 'archived';

export type SeatSignal = 'open' | 'few_left' | 'full';

export interface CourseStatus {
  id: string;
  badge: CourseBadge;
  seatSignal: SeatSignal;
  canEnrol: boolean;
  canJoinWaitlist: boolean;
  canRegisterInterest: boolean;
  countdownTo: string | null;
}

export interface ServiceStatus {
  id: string;
  badge: ServiceBadge;
  canBook: boolean;
  canEnquire: boolean;
  canJoinWaitlist: boolean;
}

export interface StatusPayload {
  /** Server time — a device with a skewed clock must not skew countdowns. */
  now: string;
  courses: CourseStatus[];
  services: ServiceStatus[];
}

export const STATUS_CACHE_CONTROL =
  'public, max-age=30, s-maxage=60, stale-while-revalidate=300';

export const clockOffsetMs = (serverNowIso: string, clientNow = Date.now()) =>
  Date.parse(serverNowIso) - clientNow;

export const correctedNow = (offsetMs: number, clientNow = Date.now()) =>
  clientNow + offsetMs;

export interface Remaining {
  total: number; days: number; hours: number;
  minutes: number; seconds: number; expired: boolean;
}

export function remaining(targetIso: string, nowMs: number): Remaining {
  const total = Math.max(0, Date.parse(targetIso) - nowMs);
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1000) % 60),
    expired: total <= 0,
  };
}

/**
 * Build-time status may be embedded for crawlers ONLY when it is not
 * actionable. A cached "Enrolment open" must never survive into a CTA.
 */
const ACTIONABLE = ['enrollment_open', 'closing_soon', 'available', 'limited'];
export const crawlerHint = (badge: string): string | null =>
  ACTIONABLE.includes(badge) ? null : badge;
