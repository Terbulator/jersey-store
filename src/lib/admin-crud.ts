import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';

// Shared POST/PATCH/DELETE for simple admin content tables.
// Each route module builds one spec and re-exports the three handlers.

export interface CrudSpec {
  /** PostgREST table name */
  table: string;
  /** Writable column allowlist */
  fields: string[];
  /** Column that must be non-empty on create */
  require?: string;
  /** Defaults merged into inserted rows (e.g. sort_order) */
  defaults?: Record<string, unknown>;
  /** Columns coerced to boolean on write */
  boolFields?: string[];
  /** Columns coerced to number on write; '' becomes null */
  numericFields?: string[];
}

const coerce = (spec: CrudSpec, row: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  for (const k of spec.fields) {
    if (row[k] === undefined) continue;
    let v = row[k];
    if (v === null || v === '') {
      out[k] = null;
      continue;
    }
    if (spec.boolFields?.includes(k)) v = !!v;
    if (spec.numericFields?.includes(k)) v = Number(v);
    out[k] = v;
  }
  return out;
};

export function makeCrudApi(spec: CrudSpec) {
  async function POST(req: NextRequest) {
    await requireAdmin();
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
    if (spec.require && !String(body[spec.require] ?? '').trim()) {
      return NextResponse.json({ error: `Missing ${spec.require}.` }, { status: 400 });
    }
    const row = { ...(spec.defaults ?? {}), ...coerce(spec, body) };
    const sb = await adminDataClient();
    const { error } = await sb.from(spec.table).insert(row);
    if (error) return NextResponse.json({ error: 'Could not create.' }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  async function PATCH(req: NextRequest) {
    await requireAdmin();
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
    const updates = coerce(spec, patch ?? {});
    if (!Object.keys(updates).length) return NextResponse.json({ ok: true });
    updates.updated_at = new Date().toISOString();
    const sb = await adminDataClient();
    const { error } = await sb.from(spec.table).update(updates).eq('id', id);
    if (error) return NextResponse.json({ error: 'Could not save.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  async function DELETE(req: NextRequest) {
    await requireAdmin();
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
    const sb = await adminDataClient();
    const { error } = await sb.from(spec.table).delete().eq('id', id);
    if (error) return NextResponse.json({ error: 'Could not delete.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return { POST, PATCH, DELETE };
}