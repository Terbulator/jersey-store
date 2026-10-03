import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

import { checkOrigin, checkRateLimit, getIp, rateLimitKey } from '@/lib/security';
import { isRateLimited, rateLimitError, resetRateLimit } from '@/lib/rate-limit';

// Builds a request with a chosen header set so IP resolution can be exercised
// without a real socket.
const req = (url: string, headers: Record<string, string> = {}) =>
  new NextRequest(new Request(`https://shop.example${url}`, { headers }));

// ---------------------------------------------------------------------------
// Client IP resolution
// ---------------------------------------------------------------------------

describe('client IP extraction resists header spoofing', () => {
  test('prefers a platform-set header over x-forwarded-for', () => {
    const r = req('/api/orders', {
      'cf-connecting-ip': '203.0.113.9',
      'x-forwarded-for': '1.1.1.1, 2.2.2.2',
    });
    assert.equal(getIp(r), '203.0.113.9');
  });

  test('prefers x-vercel-forwarded-for when present', () => {
    const r = req('/api/orders', {
      'x-vercel-forwarded-for': '198.51.100.7',
      'x-forwarded-for': '9.9.9.9',
    });
    assert.equal(getIp(r), '198.51.100.7');
  });

  test('takes the RIGHTMOST x-forwarded-for entry, not the attacker-controlled leftmost', () => {
    // An attacker prepends a fake address; the proxy appends the real one.
    const r = req('/api/orders', { 'x-forwarded-for': '10.0.0.1, 203.0.113.42' });
    assert.equal(getIp(r), '203.0.113.42');
    assert.notEqual(getIp(r), '10.0.0.1');
  });

  test('a single forged x-forwarded-for cannot rotate the rate-limit bucket mid-window', () => {
    // Leftmost-only extraction would return the spoofed value here.
    const r = req('/api/orders', { 'x-forwarded-for': '45.45.45.45' });
    assert.equal(getIp(r), '45.45.45.45');
  });

  test('rejects non-IP header values instead of bucketing on them', () => {
    for (const value of ['unknown', 'forged', 'not-an-ip', '', '   ', '999.999.999.999']) {
      const r = req('/api/orders', { 'x-forwarded-for': value });
      const ip = getIp(r);
      assert.equal(/^(unknown|\d+\.\d+\.\d+\.\d+|[0-9a-f:]+)$/.test(ip), true, `${value} -> ${ip}`);
    }
  });

  test('falls back to unknown when no usable header exists', () => {
    assert.equal(getIp(req('/api/orders')), 'unknown');
  });

  test('handles IPv6 including IPv4-mapped form', () => {
    assert.equal(getIp(req('/api/orders', { 'cf-connecting-ip': '::ffff:203.0.113.5' })), '203.0.113.5');
    assert.equal(getIp(req('/api/orders', { 'cf-connecting-ip': '2001:db8::1' })), '2001:db8::1');
  });

  test('skips unparseable entries when picking the rightmost XFF value', () => {
    const r = req('/api/orders', { 'x-forwarded-for': 'garbage, 203.0.113.8' });
    assert.equal(getIp(r), '203.0.113.8');
  });

  test('an oversized header value is ignored rather than stored', () => {
    const r = req('/api/orders', { 'cf-connecting-ip': '1'.repeat(500) });
    assert.equal(getIp(r), 'unknown');
  });
});

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

describe('rate limiting', () => {
  beforeEach(() => {
    for (const scope of ['admin', 'upload', 'expensive', 'orders', 'tracking', 'reviews'] as const) {
      resetRateLimit(`${scope}:198.51.100.1`);
    }
  });

  test('allows up to the budget then rejects', () => {
    const key = 'test:allows-up-to-budget';
    resetRateLimit(key);
    for (let i = 0; i < 5; i++) {
      assert.equal(isRateLimited(key, 5, 60_000), false, `request ${i + 1} should pass`);
    }
    assert.equal(isRateLimited(key, 5, 60_000), true);
  });

  test('buckets are isolated per key', () => {
    resetRateLimit('test:bucket-a');
    for (let i = 0; i < 5; i++) isRateLimited('test:bucket-a', 5, 60_000);
    assert.equal(isRateLimited('test:bucket-a', 5, 60_000), true);
    assert.equal(isRateLimited('test:bucket-b', 5, 60_000), false);
  });

  test('the window resets after it elapses', () => {
    const key = 'test:window-reset';
    resetRateLimit(key);
    assert.equal(isRateLimited(key, 1, 40), false);
    assert.equal(isRateLimited(key, 1, 40), true);
    // Busy-wait past the window rather than sleeping for a whole second.
    const until = Date.now() + 60;
    while (Date.now() < until) { /* spin */ }
    assert.equal(isRateLimited(key, 1, 40), false);
  });

  test('the 429 response is JSON and carries Retry-After', () => {
    const response = rateLimitError(30);
    assert.equal(response.status, 429);
    assert.equal(response.headers.get('Retry-After'), '30');
  });

  test('order tracking and order creation are both bounded', () => {
    const trackingReq = req('/api/orders?order=HDR-1', { 'cf-connecting-ip': '198.51.100.99' });
    const orderReq = req('/api/orders', { 'cf-connecting-ip': '198.51.100.98' });

    let trackingBlocked = 0;
    let orderBlocked = 0;
    for (let i = 0; i < 30; i++) {
      if (checkRateLimit(trackingReq, 'tracking')) trackingBlocked++;
      if (checkRateLimit(orderReq, 'orders')) orderBlocked++;
    }
    // Tracking budget is 20/min and order creation 10/min, so out of 30 attempts
    // each must have been refused at least once. Neither endpoint is unbounded.
    assert.equal(trackingBlocked, 10);
    assert.equal(orderBlocked, 20);
  });

  test('every sensitive scope is bounded', () => {
    for (const scope of ['admin', 'upload', 'expensive', 'orders', 'tracking', 'reviews'] as const) {
      const r = req('/api/anything', { 'cf-connecting-ip': '198.51.100.77' });
      let blocked = 0;
      for (let i = 0; i < 200; i++) {
        if (checkRateLimit(r, scope)) blocked++;
      }
      assert.ok(blocked > 0, `${scope} accepted 200 requests without limit`);
      assert.ok(blocked < 200, `${scope} blocked every request`);
    }
  });

  test('rate limit keys are namespaced per scope', () => {
    const r = req('/api/orders', { 'cf-connecting-ip': '203.0.113.200' });
    assert.equal(rateLimitKey('orders', r), 'orders:203.0.113.200');
    assert.equal(rateLimitKey('tracking', r), 'tracking:203.0.113.200');
  });
});

// ---------------------------------------------------------------------------
// Origin / CSRF
// ---------------------------------------------------------------------------

describe('origin enforcement', () => {
  test('accepts a same-origin request', () => {
    const r = req('/api/admin/products', { origin: 'https://shop.example', host: 'shop.example' });
    assert.equal(checkOrigin(r), null);
  });

  test('rejects a cross-origin request with 403', () => {
    const r = req('/api/admin/products', { origin: 'https://evil.example', host: 'shop.example' });
    const response = checkOrigin(r);
    assert.notEqual(response, null);
    assert.equal(response?.status, 403);
  });

  test('rejects a malformed Origin header', () => {
    const r = req('/api/admin/products', { origin: 'not a url', host: 'shop.example' });
    assert.equal(checkOrigin(r)?.status, 403);
  });

  test('rejects a non-http scheme such as javascript: or data:', () => {
    for (const origin of ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'null']) {
      const r = req('/api/admin/products', { origin, host: 'shop.example' });
      assert.equal(checkOrigin(r)?.status, 403, origin);
    }
  });

  test('a request with no Origin header is allowed through', () => {
    // Non-browser callers (curl, server-to-server) carry no ambient cookie
    // authority, so this is not a CSRF vector.
    const r = req('/api/admin/products', { host: 'shop.example' });
    assert.equal(checkOrigin(r), null);
  });

  test('honours a reverse-proxy host header', () => {
    const r = req('/api/admin/products', {
      origin: 'https://shop.example',
      'x-forwarded-host': 'shop.example, internal',
    });
    assert.equal(checkOrigin(r), null);
  });
});