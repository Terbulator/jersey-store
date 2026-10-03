import type { NextRequest } from 'next/server';

// Small request-parsing helpers shared by the API routes. Kept dependency-free so
// they can be unit tested without booting Next.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True only for a canonical lowercase-or-uppercase UUID. */
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

/**
 * Parses a JSON body, returning null for malformed input instead of throwing.
 * A route that forgets this turns a bad payload into a 500 instead of a 400.
 */
export async function readJson<T = Record<string, unknown>>(req: NextRequest): Promise<T | null> {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
    return body as T;
  } catch {
    return null;
  }
}