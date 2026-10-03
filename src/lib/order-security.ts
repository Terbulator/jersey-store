import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

// Order identifiers and guest-tracking secrets.
//
// Two separate concerns:
//   * `order_number` is a human-facing reference shown in the admin UI. It is NOT a
//     secret and must not be guessable enough to be an enumeration handle, so its
//     random component comes from the OS CSPRNG (never Math.random).
//   * `tracking_token` IS the guest's bearer secret. The raw value is handed to the
//     customer exactly once at checkout; only its SHA-256 digest is persisted, so a
//     database leak cannot be replayed against the tracking endpoint.

/** Bytes of entropy in a tracking token. */
const TOKEN_BYTES = 32;

/** Number of random bytes behind the human-facing order number. */
const ORDER_NUMBER_BYTES = 6;

// Crockford-style alphabet: no I/L/O/U, so order numbers survive being read aloud
// or retyped by support staff.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export const TRACKING_TOKEN_BYTES = TOKEN_BYTES;
export const TRACKING_TOKEN_LENGTH = TOKEN_BYTES * 2;
export const ORDER_NUMBER_PATTERN = /^HDR-[0-9]{6}-[0-9A-Z]{6}$/;

/**
 * Cryptographically secure random hex string, 32 bytes => 64 hex chars.
 * Uses node:crypto randomBytes (OS CSPRNG), not Math.random().
 */
export function generateTrackingToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

/**
 * SHA-256 digest of the raw token. This is what lands in `orders.tracking_token`.
 * Hex output is fixed length, so it can carry a unique index safely.
 */
export function hashTrackingToken(rawToken: string): string {
  return createHash('sha256').update(rawToken, 'utf8').digest('hex');
}

/**
 * Creates a fresh tracking credential.
 * `raw` goes to the customer; `hash` goes in the database.
 */
export function createTrackingCredential(): { raw: string; hash: string } {
  const raw = generateTrackingToken();
  return { raw, hash: hashTrackingToken(raw) };
}

function randomBase32(byteLength: number): string {
  const bytes = randomBytes(byteLength);
  let out = '';
  for (let i = 0; i < byteLength; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/**
 * Order number: HDR-<8 chars date-ish segment>-<6 chars CSPRNG>.
 * The date segment keeps orders roughly sortable for humans; the random segment is
 * what stops consecutive orders from being sequentially guessable.
 */
export function generateOrderNumber(now: Date = new Date()): string {
  const year = now.getUTCFullYear() % 100;
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const stamp = `${year}${month}${day}`;
  return `HDR-${stamp}-${randomBase32(ORDER_NUMBER_BYTES)}`;
}

/** Constant-time comparison of two hex digests. */
export function safeEqualHex(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}

/**
 * Client-generated idempotency key, used to make a retried checkout safe.
 * 16 random bytes => 32 hex chars.
 */
export function generateIdempotencyKey(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Accepted shape for a client-supplied idempotency key: 16-64 chars of URL-safe
 * base64 / hex. Restricting the alphabet keeps the value safe to store and index
 * and stops a caller from smuggling SQL/JSON metacharacters into the dedup lookup.
 */
export const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;