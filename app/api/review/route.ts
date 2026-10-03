import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Review submissions go to REVIEW_WEBHOOK_URL for you to moderate. Nothing is
 * published automatically: approved reviews are added to data/reviews.ts.
 */
export async function POST(req: Request) {
  const url = process.env.REVIEW_WEBHOOK_URL?.trim();
  if (!url) return NextResponse.json({ error: 'Reviews are not open yet.' }, { status: 503 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const name = str(body?.name, 60);
  const orderId = str(body?.orderId, 40);
  const text = str(body?.text, 1500);
  const title = str(body?.title, 120);
  const rating = Number(body?.rating);
  if (!name || text.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5 || body?.consent !== true) {
    return NextResponse.json({ error: 'Please add your name, a rating, at least a sentence, and tick the consent box.' }, { status: 400 });
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'review.submitted', name, orderId, rating, title, text, submittedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(String(res.status));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not send your review. Please try again later.' }, { status: 502 });
  }
}
