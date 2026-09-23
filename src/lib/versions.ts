import type { SupabaseClient } from '@supabase/supabase-js';

export type VersionScope = 'homepage' | 'theme' | 'header' | 'footer' | 'templates';

export interface CmsVersion {
  id: string;
  scope: string;
  author_email: string | null;
  summary: string | null;
  created_at: string;
  snapshot?: unknown;
}

const KEEP_PER_SCOPE = 30;

// Records a version, then prunes older ones beyond the keep window.
export async function recordVersion(
  sb: SupabaseClient,
  scope: VersionScope,
  snapshot: unknown,
  author: string | null,
  summary: string
): Promise<void> {
  await sb.from('cms_versions').insert({
    scope,
    snapshot,
    author_email: author,
    summary,
  });
  const { data } = await sb
    .from('cms_versions')
    .select('id')
    .eq('scope', scope)
    .order('created_at', { ascending: false })
    .range(KEEP_PER_SCOPE, KEEP_PER_SCOPE + 100);
  if (data?.length) {
    await sb.from('cms_versions').delete().in('id', data.map((d) => (d as { id: string }).id));
  }
}

export async function listVersions(
  sb: SupabaseClient,
  scope: VersionScope,
  limit = 20
): Promise<{ versions: CmsVersion[]; total: number }> {
  const [{ data, error }, { count }] = await Promise.all([
    sb.from('cms_versions').select('id, scope, author_email, summary, created_at').eq('scope', scope).order('created_at', { ascending: false }).limit(limit),
    sb.from('cms_versions').select('id', { count: 'exact', head: true }).eq('scope', scope),
  ]);
  if (error) throw new Error('Could not load versions.');
  return { versions: (data ?? []) as CmsVersion[], total: count ?? 0 };
}

export async function getVersionSnapshot(sb: SupabaseClient, id: string): Promise<{ scope: string; snapshot: unknown }> {
  const { data, error } = await sb.from('cms_versions').select('scope, snapshot').eq('id', id).maybeSingle();
  if (error || !data) throw new Error('Version not found.');
  return data as { scope: string; snapshot: unknown };
}
