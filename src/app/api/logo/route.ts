import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const p = searchParams.get('p') || searchParams.get('path');
    if (!p) return new Response('path missing', { status: 400 });

    const backendBase = process.env.NEXT_PUBLIC_API_BACKEND_URL ?? 'http://localhost:3333';
    const path = p.startsWith('/') ? p : `/${p}`;
    const absolute = `${backendBase.replace(/\/$/, '')}${path}`;

    // Forward cookies/authorization from incoming request
    const headers: Record<string, string> = {};
    const cookie = req.headers.get('cookie');
    if (cookie) headers['cookie'] = cookie;

    const resp = await fetch(absolute, { headers });
    const contentType = resp.headers.get('content-type') ?? 'application/octet-stream';

    const body = await resp.arrayBuffer();
    return new Response(body, {
      status: resp.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': resp.headers.get('cache-control') || 'no-cache'
      }
    });
  } catch (err: any) {
    console.error('API /api/logo error', err);
    return new Response('error', { status: 500 });
  }
}
