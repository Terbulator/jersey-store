import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';

// Public: tells the client whether the current user holds an admin role.

export async function GET() {
  const session = await getAdminSession();
  return NextResponse.json({ role: session.status === 'ok' ? session.role : null });
}