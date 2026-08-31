import { NextResponse } from 'next/server';
import { getSession, SessionUser } from '@/lib/session';
import { can } from '@/lib/rbac';
import { Role } from '@prisma/client';

export async function requireAuth(permissions?: string[]): Promise<{
  user: SessionUser | null;
  error: NextResponse | null;
}> {
  const user = await getSession();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (permissions && !permissions.some((p) => can(user.role, p))) {
    return { user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user, error: null };
}
