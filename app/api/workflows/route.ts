import { NextRequest, NextResponse } from 'next/server';

const N8N_BASE = process.env.N8N_WEBHOOK_BASE_URL || 'https://n8ncurso-n8n.xhgix3.easypanel.host';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams.toString();
  try {
    const res = await fetch(`${N8N_BASE}/webhook/dashboard/workflows?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ error: res.statusText }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
