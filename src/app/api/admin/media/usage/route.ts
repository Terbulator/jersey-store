import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, adminDataClient } from '@/lib/admin';
import { findMediaUsage } from '@/lib/media-usage';

// ?url=… → every CMS location referencing the asset.
export async function GET(req: NextRequest) {
  await requireAdmin();
  const url = new URL(req.url).searchParams.get('url') ?? '';
  if (!url) return NextResponse.json({ usage: [] });
  const sb = await adminDataClient();
  return NextResponse.json({ usage: await findMediaUsage(sb, url) });
}
