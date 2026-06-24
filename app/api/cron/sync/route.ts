import { NextRequest, NextResponse } from 'next/server';
import { syncN8n } from '@/lib/sync-n8n';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (process.env.CRON_SECRET && auth !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};
  try {
    results.n8n = await syncN8n();
  } catch (e) {
    results.n8n = { error: String(e) };
  }

  return NextResponse.json({ ok: true, results, at: new Date().toISOString() });
}
