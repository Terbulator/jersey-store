import { parseSectionSettings } from '../src/lib/section-schemas';

function ok(key: string, raw: unknown) {
  const r = parseSectionSettings(key, raw);
  if (!r.ok) throw new Error(`${key}: expected ok, got ${r.error}`);
  return r.settings;
}
function notOk(key: string, raw: unknown) {
  const r = parseSectionSettings(key, raw);
  if (r.ok) throw new Error(`${key}: expected rejection`);
  return r.error;
}

// valid payloads pass
ok('hero', { headline: 'Hello', image_url: '/shop', cta_url: 'https://headerr.in/shop' });
ok('hero', { desktop_image: '/hero-desktop.jpg', mobile_image: '/hero-mobile.jpg' });
ok('bundle_section', { pricing: [{ label: 'A', price: '2499', was: 2999 }] }); // coerces string number
ok('expert_section', { arguments: [{ value: '10', label: 'Checks per seam' }] });
ok('story_slides', { slides: [{ label: 'x', href: '/player' }] }); // legacy slide w/o id/code ok
ok('trust_strip', { items: ['a', 'b'] });

// unsafe URL schemes rejected
if (!notOk('hero', { cta_url: 'javascript:alert(1)' }).includes('URL scheme')) throw new Error('javascript: blocked');
if (!notOk('hero', { image_url: 'data:text/html;base64,PHNjcmlwdD4=' }).includes('URL scheme')) throw new Error('data: blocked');
if (!notOk('editorial_split', { cta_url: 'vbscript:msgbox(1)' }).includes('URL scheme')) throw new Error('vbscript: blocked');

// unknown sections rejected
if (!notOk('mystery', {}).includes('Unknown section')) throw new Error('unknown key blocked');
// unknown settings keys stripped
const hero = ok('hero', { headline: 'H', injected: 'javascript:alert(1)' });
if ('injected' in hero) throw new Error('unknown key stripped');

console.log('OK — section schema checks passed');