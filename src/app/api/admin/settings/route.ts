import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { themeSchema } from '@/lib/theme';
import { headerSchema, footerSchema } from '@/lib/site-chrome';
import { templateSchema } from '@/lib/display';
import { recordVersion, type VersionScope } from '@/lib/versions';
import { checkOrigin, checkRateLimit } from '@/lib/security';
import { logAudit } from '@/lib/audit';

export async function GET() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb.from('site_settings').select('key, value');
  if (error) return NextResponse.json({ error: 'Could not load settings.' }, { status: 500 });
  const settings: Record<string, unknown> = {};
  for (const row of data ?? []) settings[row.key] = row.value;
  return NextResponse.json({ settings });
}

const ALLOWED_KEYS = ['shipping', 'contact', 'site', 'theme', 'header', 'footer', 'templates'];

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  const blocked = checkOrigin(req) ?? checkRateLimit(req);
  if (blocked) return blocked;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid settings.' }, { status: 400 });
  }
  const sb = await adminDataClient();
  const author = session.user.email ?? null;
  const versioned: VersionScope[] = ['theme', 'header', 'footer', 'templates'];
  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_KEYS.includes(key)) continue;
    let stored = value;
    if (key === 'theme' || key === 'header' || key === 'footer' || key === 'templates') {
      const schema = key === 'theme' ? themeSchema : key === 'header' ? headerSchema : key === 'footer' ? footerSchema : templateSchema;
      const parsed = schema.safeParse(value ?? {});
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return NextResponse.json({ error: `${key} ${issue?.path.join('.') || 'settings'}: ${issue?.message}` }, { status: 400 });
      }
      stored = parsed.data;
    }
    const { error } = await sb
      .from('site_settings')
      .upsert({ key, value: stored, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) return NextResponse.json({ error: 'Could not save settings.' }, { status: 500 });
    if (versioned.includes(key as VersionScope)) {
      await recordVersion(sb, key as VersionScope, stored, author, `Saved ${key}`);
    }
    await logAudit(sb, { actor: author, role: session.role, action: 'save', resource: 'settings', resourceId: key });
  }
  return NextResponse.json({ ok: true });
}