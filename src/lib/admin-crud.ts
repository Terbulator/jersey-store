import { NextRequest, NextResponse } from 'next/server';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { checkMutation } from '@/lib/security';
import type { Permission } from '@/lib/rbac';

// Shared POST/PATCH/DELETE for simple admin content tables.
// Each route module builds one spec and re-exports the three handlers.
//
// Every handler runs the authorization guard *before* the origin/rate check and
// long before `adminDataClient()`, so an unauthenticated caller can never reach the
// service-role key.

export interface CrudSpec {
  /** PostgREST table name */
  table: string;
  /** Writable column allowlist */
  fields: string[];
  /** Permission required to create/update rows */
  write: Permission;
  /** Permission required to delete rows */
  remove: Permission;
  /** Permission required to read the collection, if the route exposes a GET */
  read?: Permission;
  /** Column that must be non-empty on create */
  require?: string;
  /** Defaults merged into inserted rows (e.g. sort_order) */
  defaults?: Record<string, unknown>;
  /** Columns coerced to boolean on write */
  boolFields?: string[];
  /** Columns coerced to number on write; '' becomes null */
  numericFields?: string[];
  /** Row validator — return an error message to reject with 400 */
  validate?: (row: Record<string, unknown>) => string | null;
  /**
   * Whether the table has an `updated_at` column to bump on PATCH.
   * Set false for tables without one (media_assets), otherwise the update fails.
   */
  hasUpdatedAt?: boolean;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Projects an untrusted body onto the spec's column allowlist.
 * Unknown keys are dropped, so a caller cannot write a column the spec never
 * intended to be writable (created_by, role, used_count, ...).
 */
const coerce = (spec: CrudSpec, row: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  for (const k of spec.fields) {
    if (row[k] === undefined) continue;
    let v = row[k];
    if (v === null || v === '') {
      out[k] = null;
      continue;
    }
    if (typeof v === 'object') {
      // Nested structures are only allowed where the spec opts in via validate();
      // otherwise reject rather than letting arbitrary JSON into a jsonb column.
      return null;
    }
    if (spec.boolFields?.includes(k)) v = !!v;
    if (spec.numericFields?.includes(k)) {
      const n = Number(v);
      if (!Number.isFinite(n)) return null;
      v = n;
    }
    if (typeof v === 'string' && v.length > 5000) return null;
    out[k] = v;
  }
  return out;
};

const readId = (body: Record<string, unknown> | null): string | null => {
  const id = body?.id;
  return typeof id === 'string' && UUID.test(id) ? id : null;
};

export function makeCrudApi(spec: CrudSpec) {
  async function POST(req: NextRequest) {
    const guard = await authorize({ permission: spec.write });
    if (!guard.ok) return guard.response;
    const blocked = checkMutation(req);
    if (blocked) return blocked;

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
    }
    if (spec.require && !String(body[spec.require] ?? '').trim()) {
      return NextResponse.json({ error: `Missing ${spec.require}.` }, { status: 400 });
    }

    const coerced = coerce(spec, body);
    if (coerced === null) {
      // A value failed shape validation. Do NOT fall through to defaults-only: that
      // would silently insert a row with none of the caller's intended fields.
      return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
    }

    const row = { ...(spec.defaults ?? {}), ...coerced };
    if (spec.validate) {
      const err = spec.validate(row);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }
    const sb = await adminDataClient();
    const { error } = await sb.from(spec.table).insert(row);
    if (error) return NextResponse.json({ error: 'Could not create.' }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  async function PATCH(req: NextRequest) {
    const guard = await authorize({ permission: spec.write });
    if (!guard.ok) return guard.response;
    const blocked = checkMutation(req);
    if (blocked) return blocked;

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
    }
    const id = readId(body);
    if (!id) return NextResponse.json({ error: 'Missing or invalid id.' }, { status: 400 });

    const { id: _ignored, ...patch } = body;
    const updates = coerce(spec, patch);
    if (updates === null) return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
    if (spec.validate) {
      const err = spec.validate(updates);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }
    if (!Object.keys(updates).length) return NextResponse.json({ ok: true });

    if (spec.hasUpdatedAt !== false) {
      updates.updated_at = new Date().toISOString();
    }
    const sb = await adminDataClient();
    const { error } = await sb.from(spec.table).update(updates).eq('id', id);
    if (error) return NextResponse.json({ error: 'Could not save.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  async function DELETE(req: NextRequest) {
    const guard = await authorize({ permission: spec.remove });
    if (!guard.ok) return guard.response;
    const blocked = checkMutation(req, 'expensive');
    if (blocked) return blocked;

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const id = readId(body);
    if (!id) return NextResponse.json({ error: 'Missing or invalid id.' }, { status: 400 });

    const sb = await adminDataClient();
    const { error } = await sb.from(spec.table).delete().eq('id', id);
    if (error) return NextResponse.json({ error: 'Could not delete.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  /** Optional collection read, exported so a route can expose it explicitly. */
  async function GET(req: NextRequest) {
    const guard = await authorize({ permission: spec.read ?? spec.write });
    if (!guard.ok) return guard.response;
    const limit = Math.min(Number(new URL(req.url).searchParams.get('limit') ?? 200) || 200, 500);
    const sb = await adminDataClient();
    const { data, error } = await sb.from(spec.table).select('*').limit(limit);
    if (error) return NextResponse.json({ error: 'Could not load.' }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
  }

  return { GET, POST, PATCH, DELETE };
}