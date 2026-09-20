import { NextResponse } from 'next/server';

export async function GET() {
  // Return mock product data for search
  const results = [
    { id: 'p1', name: 'Brazil 2026', slug: 'brazil-2026-player', price: 2499 },
    { id: 'p2', name: 'Argentina 2026', slug: 'argentina-2026-player', price: 2499 },
    { id: 'p3', name: 'Real Madrid 2026', slug: 'real-madrid-2026-master', price: 3499 },
  ];
  return NextResponse.json({ results });
}