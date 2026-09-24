// Mobile navigation/auth regression test (touch, not just direct URL entry).
//
// Covers: Open menu -> Account -> /login -> CREATE ACCOUNT -> /signup,
// signup + login form interaction, and password show/hide on both password
// fields. Run against a local production server or the live deployment:
//
//   BASE_URL=http://127.0.0.1:3100 node tests/auth-mobile-regression.mjs
//   BASE_URL=https://jersey-store-five.vercel.app node tests/auth-mobile-regression.mjs
//
// Uses real touch taps (isMobile + hasTouch). Never submits a real account.

import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3100';
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 412, height: 915 },
];
const TEST_PASSWORD = 'TestPass123!';

let failures = 0;
function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
  if (!ok) failures += 1;
}

async function tap(locator) {
  try {
    await locator.tap({ timeout: 10000 });
  } catch {
    await locator.click({ timeout: 10000 });
  }
}

async function testViewport(browser, vp) {
  const label = `${vp.width}x${vp.height}`;
  console.log(`\n=== viewport ${label} ===`);
  const context = await browser.newContext({
    viewport: vp,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const badResponses = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const url = (m.location() && m.location().url) || '';
    // Favicon 404 is pre-existing noise, not an auth failure.
    if (m.text().includes('favicon.ico') || url.includes('favicon.ico')) return;
    consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => pageErrors.push(String(e && e.stack ? e.stack : e)));
  page.on('response', (r) => {
    // Only same-origin hard failures count; third-party noise is ignored.
    if (r.status() >= 400 && r.url().startsWith(BASE_URL) && !r.url().includes('favicon.ico')) {
      badResponses.push(`${r.status()} ${r.url()}`);
    }
  });

  try {
    // 1. Open / and tap the mobile menu.
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    const menuBtn = page.getByRole('button', { name: 'Open menu' });
    check(`[${label}] Open menu button visible`, await menuBtn.isVisible().catch(() => false));
    await tap(menuBtn);
    await page.waitForTimeout(1200);

    // 2. Tap Account inside the mobile overlay (not the footer/header).
    const overlayAccount = page.locator('div.fixed.inset-0 nav a', { hasText: 'Account' }).first();
    const accountVisible = await overlayAccount.isVisible().catch(() => false);
    check(`[${label}] Account reachable by touch in mobile menu`, accountVisible);
    if (!accountVisible) {
      await context.close();
      return;
    }
    await tap(overlayAccount);
    await page.waitForTimeout(2500);
    check(
      `[${label}] Account tap reaches /login when unauthenticated`,
      /\/login/.test(page.url()),
      page.url()
    );

    // 3. Mobile menu must also offer Create Account -> /signup.
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    await tap(page.getByRole('button', { name: 'Open menu' }));
    await page.waitForTimeout(1200);
    const overlaySignup = page.locator('div.fixed.inset-0 nav a', { hasText: 'Create Account' }).first();
    const signupVisible = await overlaySignup.isVisible().catch(() => false);
    check(`[${label}] Create Account reachable by touch in mobile menu`, signupVisible);
    if (signupVisible) {
      await tap(overlaySignup);
      await page.waitForTimeout(2000);
      check(`[${label}] Create Account tap reaches /signup`, /\/signup/.test(page.url()), page.url());
    }

    // 4. From /login, tap CREATE ACCOUNT -> /signup.
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    const createLink = page.getByRole('link', { name: /CREATE ACCOUNT/i });
    check(`[${label}] CREATE ACCOUNT link visible on /login`, await createLink.isVisible().catch(() => false));
    await tap(createLink);
    await page.waitForTimeout(2000);
    check(`[${label}] CREATE ACCOUNT tap reaches /signup`, /\/signup/.test(page.url()), page.url());

    // 5. Signup form interaction.
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.locator('input[autocomplete="name"]').first().fill('Test User');
    check(`[${label}] signup name field editable`, true);
    await page.locator('input[type="email"]').first().fill('test@example.com');
    check(`[${label}] signup email field editable`, true);

    const pw = page.locator('input[autocomplete="new-password"]').first();
    const confirmPw = page.locator('input[autocomplete="new-password"]').nth(1);
    check(`[${label}] signup password starts masked`, (await pw.getAttribute('type')) === 'password');
    check(`[${label}] signup confirm starts masked`, (await confirmPw.getAttribute('type')) === 'password');

    for (const [idx, [field, name]] of [
      [pw, 'signup password'],
      [confirmPw, 'signup confirm password'],
    ].entries()) {
      await field.fill(TEST_PASSWORD);
      // Scope the toggle to this field's own wrapper (each PasswordField
      // renders input + toggle button as siblings inside div.relative).
      const showBtn = field.locator('xpath=following-sibling::button');
      check(`[${label}] ${name}: Show password button visible`, await showBtn.isVisible().catch(() => false));
      check(`[${label}] ${name}: toggle reads Show password`, (await showBtn.getAttribute('aria-label').catch(() => '')) === 'Show password');
      await tap(showBtn);
      await page.waitForTimeout(300);
      check(`[${label}] ${name}: tap Show reveals`, (await field.getAttribute('type')) === 'text');
      check(`[${label}] ${name}: value preserved`, (await field.inputValue()) === TEST_PASSWORD);
      check(`[${label}] ${name}: stays focused`, await field.evaluate((el) => document.activeElement === el));
      check(`[${label}] ${name}: toggle reads Hide password`, (await showBtn.getAttribute('aria-label').catch(() => '')) === 'Hide password');
      await tap(showBtn);
      await page.waitForTimeout(300);
      check(`[${label}] ${name}: tap Hide masks again`, (await field.getAttribute('type')) === 'password');
      check(`[${label}] ${name}: value preserved after hide`, (await field.inputValue()) === TEST_PASSWORD);
      void idx;
    }
    const createBtn = page.getByRole('button', { name: /CREATE ACCOUNT/i });
    check(`[${label}] signup Create Account button usable`, await createBtn.isVisible().catch(() => false));

    // 6. Login form interaction.
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.locator('input[type="email"]').first().fill('test@example.com');
    check(`[${label}] login email field editable`, true);
    const loginPw = page.locator('input[autocomplete="current-password"]').first();
    check(`[${label}] login password starts masked`, (await loginPw.getAttribute('type')) === 'password');
    await loginPw.fill(TEST_PASSWORD);
    const loginToggle = loginPw.locator('xpath=following-sibling::button');
    await tap(loginToggle);
    await page.waitForTimeout(300);
    check(`[${label}] login: tap Show reveals`, (await loginPw.getAttribute('type')) === 'text');
    check(`[${label}] login: value preserved`, (await loginPw.inputValue()) === TEST_PASSWORD);
    check(
      `[${label}] login: stays focused`,
      await loginPw.evaluate((el) => document.activeElement === el)
    );
    await tap(loginToggle);
    await page.waitForTimeout(300);
    check(`[${label}] login: tap Hide masks again`, (await loginPw.getAttribute('type')) === 'password');
    const loginBtn = page.getByRole('button', { name: /^LOG IN$/i });
    check(`[${label}] login button usable`, await loginBtn.isVisible().catch(() => false));

    // 7. No unexpected errors.
    check(`[${label}] no unexpected console errors`, consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));
    check(`[${label}] no page errors`, pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));
    check(`[${label}] no failed same-origin requests`, badResponses.length === 0, badResponses.slice(0, 3).join(' | '));
  } catch (e) {
    check(`[${label}] no test exception`, false, String(e).slice(0, 300));
  }
  await context.close();
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
for (const vp of VIEWPORTS) {
  await testViewport(browser, vp);
}
await browser.close();

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log('\nAll mobile regression checks passed');
