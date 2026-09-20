import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ items: [], subtotal: 0, shipping: 0 });
}

export async function POST() {
  return NextResponse.json({ success: true });
}