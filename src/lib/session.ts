import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

export async function getSession(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = session.user as { id?: string; email?: string; name?: string | null; role?: string };
  if (!user.id || !user.email || !user.role) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: user.role as Role,
  };
}
