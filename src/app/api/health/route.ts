import { NextResponse } from 'next/server';

// Health check público (sin auth). GET /api/health -> { status: 'ok' }
// Sirve para verificar que el deploy responde antes de una demo.
export function GET() {
  return NextResponse.json({ status: 'ok' });
}
