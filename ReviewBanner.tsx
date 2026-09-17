/**
 * Admin-only warning that a page still carries placeholder copy.
 *
 * Env-gated until auth is wired in Phase 9, so it never reaches a
 * production visitor. Set NEXT_PUBLIC_SHOW_REVIEW_BANNERS=true on the
 * Preview environment only.
 */
export function ReviewBanner({ show, label }: { show: boolean; label: string }) {
  if (!show || process.env.NEXT_PUBLIC_SHOW_REVIEW_BANNERS !== 'true') return null;
  return <p className="review-banner" role="note">⚠ {label}</p>;
}
