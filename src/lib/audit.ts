import type { SupabaseClient } from '@supabase/supabase-js';

export interface AuditEvent {
  actor?: string | null;
  role?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  summary?: string | null;
}

// Best-effort audit trail for admin mutations. Never throws (logging must
// not break the mutation it observes) and never records secrets — callers
// pass short human summaries only.
export async function logAudit(sb: SupabaseClient, e: AuditEvent): Promise<void> {
  try {
    await sb.from('audit_logs').insert({
      actor_email: e.actor ?? null,
      actor_role: e.role ?? null,
      action: e.action.slice(0, 80),
      resource: e.resource.slice(0, 80),
      resource_id: e.resourceId?.slice(0, 200) ?? null,
      summary: e.summary?.slice(0, 500) ?? null,
    });
  } catch {
    /* audit is observability, not control flow */
  }
}
