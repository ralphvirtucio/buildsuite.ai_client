import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Development: short-circuit with a mocked valid session
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        valid: true,
        companyName: 'BuildSuite (Dev)',
        firstName: 'Dev',
        lastName: 'User',
        timezone: 'UTC',
        locationId: 'IifYfP2B2NUaoDPdsTTa',
        buildsuite_user_id: '067d5e07-c01f-4d62-b174-d7eaaac2a0cd',
        createdAt: new Date().toISOString(),
        sessionId: 'dev_session',
      });
    }

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
    // Include server-issued sessionId so client can use the correct ID
    return NextResponse.json({ ...data, sessionId });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to validate session' }, { status: 500 });
  }
}
