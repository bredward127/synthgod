'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { track } from '@/lib/analytics/track';

type Field = { name: string; label: string; type?: 'text' | 'email' | 'tel' | 'textarea'; required?: boolean; autoComplete?: string };

/**
 * Lead / enquiry form. Posts JSON to `action` (default /api/lead). Only the
 * form id reaches analytics; field values never do. An explicit consent
 * checkbox is required before submit.
 */
export default function LeadForm({
  id,
  title,
  fields,
  consentLabel,
  submitLabel = 'Send',
  action = '/api/lead',
}: {
  id: string;
  title?: string;
  fields: Field[];
  consentLabel: string;
  submitLabel?: string;
  action?: string;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState('sending');
    try {
      const res = await fetch(action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ formId: id, ...data }) });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? 'Something went wrong. Please try again.');
      track('lead_submit', { form_id: id });
      setState('sent');
      form.reset();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div role="status" className="rounded-3xl border-2 border-brand-line bg-brand-surface p-8 text-center">
        <CheckCircle2 aria-hidden="true" className="mx-auto h-10 w-10 text-brand-accent2" />
        <p className="mt-3 font-display text-xl font-bold text-brand-ink">Thanks, we got it.</p>
      </div>
    );
  }

  const input = 'mt-1 w-full rounded-xl border-2 border-brand-line bg-brand-bg px-4 py-3 text-base text-brand-ink focus:border-brand-accent focus:outline-none';
  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border-2 border-brand-line bg-brand-surface p-6 sm:p-8">
      {title ? <h2 className="font-display text-2xl font-bold text-brand-ink">{title}</h2> : null}
      {fields.map((f) => (
        <label key={f.name} className="block text-sm font-semibold text-brand-ink">
          {f.label}
          {f.required ? <span aria-hidden="true"> *</span> : null}
          {f.type === 'textarea' ? (
            <textarea name={f.name} required={f.required} rows={4} className={input} />
          ) : (
            <input name={f.name} type={f.type ?? 'text'} required={f.required} autoComplete={f.autoComplete} className={input} />
          )}
        </label>
      ))}
      <label className="flex items-start gap-3 text-sm text-brand-muted">
        <input type="checkbox" name="consent" value="yes" required className="mt-1 h-4 w-4 accent-[rgb(var(--accent))]" />
        {consentLabel}
      </label>
      {state === 'error' ? (
        <p role="alert" className="text-sm font-semibold text-red-600">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-accent px-6 py-4 font-extrabold text-brand-accent-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {state === 'sending' ? <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" /> : null}
        {submitLabel}
      </button>
    </form>
  );
}
