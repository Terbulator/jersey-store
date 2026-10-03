import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Asserts the response headers the app actually ships, read from the real config
// module so the check cannot drift from production behaviour.

const root = join(process.cwd());
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CSP, SECURITY_HEADERS } = require(join(root, 'security-headers.cjs')) as {
  CSP: string;
  SECURITY_HEADERS: { key: string; value: string }[];
};

const header = (key: string) => SECURITY_HEADERS.find((h) => h.key === key)?.value;
const directives = () =>
  Object.fromEntries(
    CSP.split(';').map((d) => {
      const [name, ...rest] = d.trim().split(/\s+/);
      return [name, rest];
    })
  ) as Record<string, string[]>;

describe('security headers', () => {
  test('Content-Security-Policy is present and defaults to self', () => {
    assert.ok(header('Content-Security-Policy'), 'CSP header missing');
    assert.deepEqual(directives()['default-src'], ["'self'"]);
  });

  test('framing is denied at both the CSP and the legacy header', () => {
    assert.deepEqual(directives()['frame-ancestors'], ["'none'"]);
    assert.equal(header('X-Frame-Options'), 'DENY');
  });

  test('MIME sniffing is disabled', () => {
    assert.equal(header('X-Content-Type-Options'), 'nosniff');
  });

  test('referrer policy does not leak full URLs cross-origin', () => {
    assert.equal(header('Referrer-Policy'), 'strict-origin-when-cross-origin');
  });

  test('permissions policy locks down unused device APIs', () => {
    const value = header('Permissions-Policy') ?? '';
    for (const feature of ['camera=()', 'microphone=()', 'geolocation=()', 'payment=()', 'usb=()']) {
      assert.ok(value.includes(feature), `${feature} missing`);
    }
  });

  test('HSTS is set with a long max-age and subdomains', () => {
    const value = header('Strict-Transport-Security') ?? '';
    assert.match(value, /max-age=\d{7,}/);
    assert.ok(value.includes('includeSubDomains'));
    // `preload` is an irreversible commitment and is intentionally not asserted here.
  });

  test('plugins and base URIs are pinned', () => {
    assert.deepEqual(directives()['object-src'], ["'none'"]);
    assert.deepEqual(directives()['base-uri'], ["'self'"]);
    assert.deepEqual(directives()['form-action'], ["'self'"]);
  });

  test('the CSP keeps the sources the storefront genuinely needs', () => {
    const d = directives();
    // Next.js injects inline bootstrap scripts; removing 'unsafe-inline' here would
    // break every page. Documented as an accepted residual risk.
    assert.ok(d['script-src'].includes("'self'"));
    assert.ok(d['style-src'].includes('https://fonts.googleapis.com'));
    assert.ok(d['font-src'].includes('https://fonts.gstatic.com'));
    assert.ok(d['img-src'].includes('data:'));
    assert.ok(d['connect-src'].some((s) => s.includes('supabase.co')));
    assert.ok(d['connect-src'].some((s) => s.startsWith('wss://')));
  });

  test('cross-origin isolation headers are present', () => {
    assert.equal(header('Cross-Origin-Opener-Policy'), 'same-origin');
    assert.equal(header('Cross-Origin-Resource-Policy'), 'same-origin');
  });

  test('next.config.js actually applies the shared header set', () => {
    const config = readFileSync(join(root, 'next.config.js'), 'utf8');
    assert.ok(config.includes('SECURITY_HEADERS'), 'next.config.js must apply the shared headers');
    assert.ok(config.includes("source: '/:path*'"), 'headers must be applied site-wide');
    assert.ok(config.includes('poweredByHeader: false'), 'X-Powered-By must be disabled');
  });

  test('admin and api responses are marked private and no-store', () => {
    const config = readFileSync(join(root, 'next.config.js'), 'utf8');
    assert.ok(config.includes("source: '/admin/:path*'"));
    assert.ok(config.includes("source: '/api/:path*'"));
    assert.ok(config.includes('private, no-store'));
  });
});