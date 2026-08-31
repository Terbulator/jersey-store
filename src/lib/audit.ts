import { prisma } from '@/lib/prisma';
import { Prisma, Role } from '@prisma/client';

interface AuditInput {
  actorId: string;
  actorEmail: string;
  actorRole: Role;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  ip?: string;
  result?: string;
}

export async function logAudit(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        actorEmail: input.actorEmail,
        actorRole: input.actorRole,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        oldValues: input.oldValues ?? undefined,
        newValues: input.newValues ?? undefined,
        ip: input.ip,
        result: input.result ?? 'success',
      },
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
