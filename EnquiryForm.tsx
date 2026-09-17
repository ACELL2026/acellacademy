'use client';
import { useState } from 'react';
import type { Locale } from '@/lib/i18n/config';

/**
 * Public enquiry form — an UNAUTHENTICATED WRITE PATH.
 *
 * Honeypot is off-screen rather than display:none, because some bots skip
 * display:none fields. Server-side rate limiting lands with the API route
 * in Phase 9; until then the mailto fallback below always works, so a
 * visitor is never stranded.
 */
export function EnquiryForm({ locale, dict, contactEmail, serviceSlug }: {
  locale: Locale;
  dict: { name: string; email: string; message: string; send: string; sending: string; sent: string; error: string; orEmail: string };
  contactEmail: string;
  serviceSlug: string | null;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'), email: fd.get('email'), message: fd.get('message'),
          serviceSlug, locale, website: fd.get('website'),
        }),
      });
      setState(res.ok ? 'sent' : 'error');
    } catch { setState('error'); }
  }

  if (state === 'sent') return <p role="status" className="form-success">{dict.sent}</p>;

  return (
    <form onSubmit={onSubmit} className="stack">
      <div className="field">
        <label htmlFor="eq-name">{dict.name}</label>
        <input id="eq-name" name="name" required maxLength={120} className="input" autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="eq-email">{dict.email}</label>
        <input id="eq-email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="eq-message">{dict.message}</label>
        <textarea id="eq-message" name="message" required minLength={10} maxLength={5000} rows={6} className="input" />
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="eq-website">Leave this field empty</label>
        <input id="eq-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="btn btn--primary" disabled={state === 'sending'}>
        {state === 'sending' ? dict.sending : dict.send}
      </button>
      {state === 'error' && <p role="alert" className="form-error">{dict.error}</p>}
      <p style={{ fontSize: '.9rem', color: 'var(--fg-muted)' }}>
        {dict.orEmail} <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </p>
    </form>
  );
}
