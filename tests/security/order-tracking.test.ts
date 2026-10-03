import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  createTrackingCredential,
  generateIdempotencyKey,
  generateOrderNumber,
  generateTrackingToken,
  hashTrackingToken,
  ORDER_NUMBER_PATTERN,
  safeEqualHex,
  TRACKING_TOKEN_LENGTH,
  IDEMPOTENCY_KEY_PATTERN,
} from '@/lib/order-security';
import {
  lookupOrderForTracking,
  toTrackingView,
  TRACKING_SELECT,
  TRACKING_NOT_FOUND_MESSAGE,
  type OrderRow,
  type TrackingQuery,
} from '@/lib/order-tracking';

// ---------------------------------------------------------------------------
// Fake query builder that records the predicates it was given, so the tests can
// assert what the lookup actually asks the database.
// ---------------------------------------------------------------------------

type Predicate = { column: string; value: string };

function fakeClient(rows: OrderRow[]) {
  const log: Predicate[] = [];
  let selected = '';

  const build = () => {
    const client: TrackingQuery = {
      select(columns: string) {
        selected = columns;
        log.length = 0;
        return client;
      },
      eq(column: string, value: string) {
        log.push({ column, value });
        return client;
      },
      async maybeSingle() {
        const match = rows.find((row) =>
          log.every((p) => String((row as unknown as Record<string, unknown>)[p.column] ?? '') === p.value)
        );
        return { data: match ?? null, error: null };
      },
    };
    return client;
  };

  return {
    client: build(),
    lastSelect: () => selected,
    lastPredicates: () => [...log],
  };
}

const order = (overrides: Partial<OrderRow> = {}): OrderRow => ({
  id: 'order-1',
  order_number: 'HDR-260103-A1B2C3',
  customer_name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+91 99999 99999',
  address: { line1: '1 Analytical Way', city: 'London', state: 'LDN', pincode: '110001' },
  items: [{ productId: 'p1', name: 'Brazil 2026', size: 'L', quantity: 1, price: 2499 }],
  status: 'SHIPPED',
  payment_status: 'PENDING',
  payment_method: 'COD',
  shipping: 99,
  discount: 0,
  subtotal: 2499,
  total: 2598,
  notes: 'please gift wrap',
  user_id: null,
  // sha256 of the customer's raw token
  tracking_token: hashTrackingToken('a'.repeat(64)),
  created_at: '2026-10-03T10:00:00.000Z',
  ...overrides,
});

const RAW_TOKEN = 'a'.repeat(64);

// ---------------------------------------------------------------------------
// Token generation
// ---------------------------------------------------------------------------

describe('tracking token generation', () => {
  test('tokens are 64 hex characters (32 bytes of entropy)', () => {
    const token = generateTrackingToken();
    assert.equal(token.length, TRACKING_TOKEN_LENGTH);
    assert.equal(token.length, 64);
    assert.match(token, /^[0-9a-f]{64}$/);
  });

  test('tokens are not derived from Math.random', () => {
    // Guard the requirement directly: stub Math.random to a constant and confirm
    // the generator still produces unique, varying output.
    const original = Math.random;
    Math.random = () => 0.5;
    try {
      const a = generateTrackingToken();
      const b = generateTrackingToken();
      assert.notEqual(a, b, 'Math.random stub must not influence the token');
    } finally {
      Math.random = original;
    }
  });

  test('tokens do not repeat across many draws', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) seen.add(generateTrackingToken());
    assert.equal(seen.size, 2000);
  });

  test('only the digest is persisted; the raw value is returned separately', () => {
    const credential = createTrackingCredential();
    assert.equal(credential.raw.length, 64);
    assert.equal(credential.hash.length, 64);
    assert.equal(credential.hash, hashTrackingToken(credential.raw));
    assert.notEqual(credential.hash, credential.raw);
  });

  test('hashing is deterministic and one-way for a fixed input', () => {
    assert.equal(hashTrackingToken(RAW_TOKEN), hashTrackingToken(RAW_TOKEN));
    assert.notEqual(hashTrackingToken(RAW_TOKEN), hashTrackingToken('b'.repeat(64)));
  });

  test('idempotency keys are 32 hex characters and accept the documented alphabet', () => {
    const key = generateIdempotencyKey();
    assert.match(key, /^[0-9a-f]{32}$/);
    assert.match(key, IDEMPOTENCY_KEY_PATTERN);
    // URL-safe variants are accepted from clients too.
    assert.equal(IDEMPOTENCY_KEY_PATTERN.test('abcDEF-123_456XYZ'), true);
    assert.equal(IDEMPOTENCY_KEY_PATTERN.test('short'), false);
    assert.equal(IDEMPOTENCY_KEY_PATTERN.test(`${'a'.repeat(64)}` + "'"), false);
  });

  test('constant-time hex comparison behaves like equality', () => {
    const digest = hashTrackingToken(RAW_TOKEN);
    assert.equal(safeEqualHex(digest, digest), true);
    assert.equal(safeEqualHex(digest, hashTrackingToken('b'.repeat(64))), false);
    assert.equal(safeEqualHex(digest, digest.slice(0, 10)), false);
  });
});

// ---------------------------------------------------------------------------
// Order numbers must not be guessable
// ---------------------------------------------------------------------------

describe('order numbers', () => {
  test('match the documented shape', () => {
    assert.match(generateOrderNumber(), ORDER_NUMBER_PATTERN);
    assert.match(generateOrderNumber(new Date('2026-10-03T00:00:00Z')), /^HDR-261003-[0-9A-Z]{6}$/);
  });

  test('consecutive orders do not produce sequential numbers', () => {
    const numbers = new Set<string>();
    for (let i = 0; i < 500; i++) numbers.add(generateOrderNumber(new Date('2026-10-03T00:00:00Z')));
    assert.equal(numbers.size, 500);
  });

  test('are not reproducible by seeding Math.random', () => {
    const original = Math.random;
    Math.random = () => 0.123456;
    try {
      const a = generateOrderNumber(new Date('2026-10-03T00:00:00Z'));
      const b = generateOrderNumber(new Date('2026-10-03T00:00:00Z'));
      assert.notEqual(a, b);
    } finally {
      Math.random = original;
    }
  });
});

// ---------------------------------------------------------------------------
// Tracking lookup policy
// ---------------------------------------------------------------------------

describe('guest order tracking lookup', () => {
  test('correct order number + token returns the order', async () => {
    const { client } = fakeClient([order()]);
    const result = await lookupOrderForTracking({
      orderNumber: 'HDR-260103-A1B2C3',
      token: RAW_TOKEN,
      userId: null,
      client,
    });
    assert.equal(result.found, true);
    if (result.found) assert.equal(result.via, 'token');
  });

  test('the token is compared as a digest inside the query, not after fetching', async () => {
    const { client, lastPredicates } = fakeClient([order()]);
    await lookupOrderForTracking({
      orderNumber: 'HDR-260103-A1B2C3',
      token: RAW_TOKEN,
      userId: null,
      client,
    });
    const predicates = lastPredicates();
    assert.deepEqual(
      predicates.map((p) => p.column).sort(),
      ['order_number', 'tracking_token']
    );
    const tokenPredicate = predicates.find((p) => p.column === 'tracking_token');
    // The raw token must never be sent to the database.
    assert.equal(tokenPredicate?.value, hashTrackingToken(RAW_TOKEN));
    assert.notEqual(tokenPredicate?.value, RAW_TOKEN);
  });

  test('an order number alone does not retrieve the order', async () => {
    const { client } = fakeClient([order()]);
    const result = await lookupOrderForTracking({
      orderNumber: 'HDR-260103-A1B2C3',
      token: null,
      userId: null,
      client,
    });
    assert.equal(result.found, false);
    if (!result.found) assert.equal(result.reason, 'not_found');
  });

  test('a wrong token does not retrieve the order', async () => {
    const { client } = fakeClient([order()]);
    const result = await lookupOrderForTracking({
      orderNumber: 'HDR-260103-A1B2C3',
      token: 'f'.repeat(64),
      userId: null,
      client,
    });
    assert.equal(result.found, false);
  });

  test('an unknown order number and a wrong token are indistinguishable', async () => {
    // Same reason code and same shape for both, so the response cannot be used to
    // confirm that an order number exists.
    const { client } = fakeClient([order()]);
    const unknownOrder = await lookupOrderForTracking({
      orderNumber: 'HDR-260103-ZZZZZZ',
      token: RAW_TOKEN,
      userId: null,
      client,
    });
    const wrongToken = await lookupOrderForTracking({
      orderNumber: 'HDR-260103-A1B2C3',
      token: 'f'.repeat(64),
      userId: null,
      client,
    });
    assert.deepEqual(unknownOrder, wrongToken);
    assert.equal(unknownOrder.found, false);
    assert.equal(wrongToken.found, false);
  });

  test('a missing order number is a usage error, distinct from a failed lookup', async () => {
    const { client } = fakeClient([order()]);
    const result = await lookupOrderForTracking({ orderNumber: null, token: RAW_TOKEN, userId: null, client });
    assert.equal(result.found, false);
    if (!result.found) assert.equal(result.reason, 'missing_reference');
  });

  test('a user cannot read another user order by guessing the number', async () => {
    const { client } = fakeClient([order({ user_id: 'owner-1' })]);
    const result = await lookupOrderForTracking({
      orderNumber: 'HDR-260103-A1B2C3',
      token: null,
      userId: 'attacker-1',
      client,
    });
    assert.equal(result.found, false);
  });

  test('the owner can read their own order without the token', async () => {
    const { client } = fakeClient([order({ user_id: 'owner-1' })]);
    const result = await lookupOrderForTracking({
      orderNumber: 'HDR-260103-A1B2C3',
      token: null,
      userId: 'owner-1',
      client,
    });
    assert.equal(result.found, true);
    if (result.found) assert.equal(result.via, 'owner');
  });

  test('the owner fallback is scoped by user_id, not just order_number', async () => {
    const { client, lastPredicates } = fakeClient([order({ user_id: 'owner-1' })]);
    await lookupOrderForTracking({
      orderNumber: 'HDR-260103-A1B2C3',
      token: null,
      userId: 'owner-1',
      client,
    });
    const predicates = lastPredicates();
    assert.ok(predicates.some((p) => p.column === 'user_id' && p.value === 'owner-1'));
  });

  test('an order with no token stored cannot be retrieved by an empty token', async () => {
    const { client } = fakeClient([order({ tracking_token: null })]);
    const result = await lookupOrderForTracking({
      orderNumber: 'HDR-260103-A1B2C3',
      token: '',
      userId: null,
      client,
    });
    assert.equal(result.found, false);
  });
});

// ---------------------------------------------------------------------------
// Response projection
// ---------------------------------------------------------------------------

describe('tracking response projection', () => {
  const view = toTrackingView(order());

  test('contains what the tracking UI renders', () => {
    assert.equal(view.orderNumber, 'HDR-260103-A1B2C3');
    assert.equal(view.status, 'SHIPPED');
    assert.equal(view.paymentStatus, 'PENDING');
    assert.equal(view.total, 2598);
    assert.equal(view.subtotal, 2499);
    assert.equal(view.items.length, 1);
    assert.equal(view.items[0].name, 'Brazil 2026');
  });

  test('excludes every piece of customer PII', () => {
    const serialised = JSON.stringify(view);
    for (const pii of ['ada@example.com', '99999', 'Analytical Way', 'London', '110001', 'gift wrap']) {
      assert.equal(serialised.includes(pii), false, `response leaked ${pii}`);
    }
  });

  test('never echoes the tracking token', () => {
    assert.equal(JSON.stringify(view).includes(hashTrackingToken(RAW_TOKEN)), false);
    assert.equal(JSON.stringify(view).includes(RAW_TOKEN), false);
  });

  test('does not expose the internal row id or owner id', () => {
    const serialised = JSON.stringify(view);
    assert.equal(serialised.includes('order-1'), false);
    assert.equal('id' in (view as Record<string, unknown>), false);
    assert.equal('user_id' in (view as Record<string, unknown>), false);
  });

  test('the customer name is opt-in, never on by default', () => {
    assert.equal(view.customerName, undefined);
    const ownerView = toTrackingView(order(), { includeCustomerName: true });
    assert.equal(ownerView.customerName, 'Ada Lovelace');
  });

  test('the select list itself excludes the PII columns', () => {
    for (const column of ['email', 'phone', 'address', 'notes', 'user_id', 'tracking_token', 'payment_method']) {
      assert.equal(TRACKING_SELECT.includes(column), false, `select leaked ${column}`);
    }
  });

  test('malformed items are coerced, not passed through', () => {
    const hostile = toTrackingView(order({ items: [{ name: 'x'.repeat(5000), quantity: -4, price: 'free' }] as never }));
    assert.equal(hostile.items[0].name.length, 200);
    assert.equal(hostile.items[0].quantity, 0);
    assert.equal(hostile.items[0].price, 0);
  });

  test('a non-array items column yields an empty list rather than throwing', () => {
    const hostile = toTrackingView(order({ items: 'not-an-array' as never }));
    assert.deepEqual(hostile.items, []);
  });

  test('the generic miss message does not leak whether the order exists', () => {
    assert.equal(TRACKING_NOT_FOUND_MESSAGE, 'Order not found.');
  });
});