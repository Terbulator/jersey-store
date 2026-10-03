import { NextRequest, NextResponse } from 'next/server';
import { adminDataClient } from '@/lib/admin-session';
import { authorize } from '@/lib/api-guard';
import { checkRateLimit } from '@/lib/security';
import { findMediaUsage } from '@/lib/media-usage';

// ?url=... -> every CMS location referencing the asset.
// Read-only but it fans out across many tables, so it shares the 'expensive' budget.

export async function GET(req: NextRequest) {
  const guard = await authorize({ permission: 'media:read' });
  if (!guard.ok) return guard.response;

  const limited = checkRateLimit(req, 'expensive');
  if (limited) return limited;

  const url = new URL(req.url).searchParams.get('url') ?? '';
  if (!url || url.length > 2000) {
    return NextResponse.json({ error: 'Invalid url.' }, { status: 400 });
  }

  const sb = await adminDataClient();
  return NextResponse.json({ usage: await findMediaUsage(sb, url) });
}