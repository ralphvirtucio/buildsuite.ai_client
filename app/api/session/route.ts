import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('session_id');
    const sessionId = cookie?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session cookie' }, { status: 401 });
    }

    const base = process.env.NEXT_PUBLIC_API_ENDPOINT_URL || 'http://localhost:8000/api/v1';
    const url = `${base}/auth/validate_session?session_id=${encodeURIComponent(sessionId)}`;

    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      const msg = await res.text();
      return NextResponse.json({ error: msg || 'Session invalid' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to validate session' }, { status: 500 });
  }
}
