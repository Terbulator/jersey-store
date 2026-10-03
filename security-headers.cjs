/**
 * Shared security header definitions.
 *
 * Kept in its own module (rather than inline in next.config.js) so the security
 * regression test can assert the real values the app ships, instead of duplicating
 * a copy that could drift.
 */

// Content-Security-Policy
//
// Notes on what is deliberately NOT tightened:
//   * `script-src 'unsafe-inline'` — Next.js App Router inlines the RSC payload and
//     the hydration bootstrap into <script> tags. Removing it requires per-request
//     nonces threaded through middleware, which is a larger change than this audit.
//     Accepted residual risk: an injected inline script would still execute.
//   * `style-src 'unsafe-inline'` — required by the inline style attributes Tailwind
//     and framer-motion emit at runtime.
//   * `img-src https:` — product and editorial imagery is served from arbitrary https
//     hosts (Unsplash, Sanity, Supabase Storage), so the scheme cannot be pinned to a
//     fixed host list without breaking the storefront.
//
// Everything here is additive hardening: nothing that previously rendered stops
// rendering.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "media-src 'self' https: blob:",
  // Blocks every embedding context, including our own subframes.
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  // Stops an injected <base> or cross-origin form from redirecting a submission.
  "form-action 'self'",
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  // Blocks MIME sniffing, so a stored file cannot be re-interpreted as script.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // Do not leak internal checkout/admin URLs to third parties.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  // `preload` is intentionally omitted: it is an irreversible, domain-wide commitment
  // and must only be added once every subdomain is confirmed HTTPS-only.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  // Isolates the browsing context from cross-origin popups (tabnabbing).
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Tells other origins not to embed our resources. Images served *from* other
  // origins are unaffected, so Unsplash/Sanity/Supabase imagery still renders.
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  // Legacy IE/Edge leak vector; modern browsers ignore it and the CSP supersedes it.
  { key: 'X-XSS-Protection', value: '0' },
];

module.exports = { CSP, SECURITY_HEADERS };