import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.json({ ok: true });
  // remove cookies by setting maxAge=0
  res.cookies.set('session', '', { path: '/', maxAge: 0 });
  res.cookies.set('username', '', { path: '/', maxAge: 0 });
  return res;
}

export async function POST() {
  return GET();
}
