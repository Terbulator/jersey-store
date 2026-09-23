import { parseSectionSettings, isSafeUrl } from '../src/lib/section-schemas';
import { themeSchema, mergeTheme, resolveThemeColor, THEME_DEFAULTS } from '../src/lib/theme';
import { headerSchema, footerSchema, merge, HEADER_DEFAULTS } from '../src/lib/site-chrome';
import { templateSchema, mergeDisplay, DISPLAY_DEFAULTS } from '../src/lib/display';
import { pageSchema, validatePageSlug } from '../src/lib/pages';
import { productUpdateSchema, variantSchema } from '../src/lib/product-schemas';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`check failed: ${msg}`);
}

// --- URL safety (incl. bypass shapes) ---
assert(!isSafeUrl('javascript:alert(1)'), 'javascript: blocked');
assert(!isSafeUrl('  javascript:alert(1)'), 'leading-space javascript: blocked');
assert(!isSafeUrl('JaVaScRiPt:alert(1)'), 'mixed-case scheme blocked');
assert(!isSafeUrl('data:text/html,hi'), 'data: blocked');
assert(!isSafeUrl('vbscript:msgbox(1)'), 'vbscript: blocked');
assert(isSafeUrl('/shop'), 'relative ok');
assert(isSafeUrl('#newsletter'), 'hash ok');
assert(isSafeUrl('https://headerr.in/shop'), 'https ok');
assert(!isSafeUrl('x'.repeat(2001)), 'overlong rejected');

// --- section design overrides ---
const withDesign = parseSectionSettings('hero', { headline: 'H', design: { bg: '#ff0000', hide_on: ['mobile'], padding_y: '80' } });
assert(withDesign.ok, 'design overrides pass');
const badDesign = parseSectionSettings('hero', { design: { bg: 'javascript:alert(1)' } });
assert(!badDesign.ok, 'design URL scheme rejected');
const badToken = parseSectionSettings('hero', { design: { bg: 'token:nope!' } });
assert(!badToken.ok, 'malformed token rejected');
const okToken = parseSectionSettings('hero', { design: { bg: 'token:brand.primary' } });
assert(okToken.ok && (okToken.settings.design as { bg: string }).bg === 'token:brand.primary', 'token ref kept');

// --- theme ---
const t = themeSchema.safeParse({ colors: { 'brand.primary': '#112233' }, type: { h1: { size: 70 } }, bogus: 1 });
assert(!t.success, 'unknown theme group rejected');
const t2 = themeSchema.safeParse({ colors: { 'brand.primary': 'red' } });
assert(!t2.success, 'non-hex color rejected');
const t3 = themeSchema.safeParse({ colors: { 'brand.primary': '#112233' } });
assert(t3.success, 'partial theme passes');
const merged = mergeTheme({ colors: { 'brand.primary': '#112233' }, type: { h1: { size: 70 } } });
assert(merged.colors['brand.primary'] === '#112233', 'theme merge applies');
assert(merged.colors['surface.base'] === THEME_DEFAULTS.colors['surface.base'], 'theme merge keeps defaults');
assert(merged.type.h1.size === 70 && merged.type.h1.weight === 400, 'type role merges per-field');
assert(mergeTheme(null).colors['brand.primary'] === THEME_DEFAULTS.colors['brand.primary'], 'null theme = defaults');
assert(resolveThemeColor('token:brand.primary', merged) === '#112233', 'token resolves');
assert(resolveThemeColor('#fff000', merged) === '#fff000', 'hex passes through');
assert(resolveThemeColor('token:nope', merged) === undefined, 'unknown token → undefined');
assert(resolveThemeColor(undefined, merged) === undefined, 'empty → undefined');

// --- header/footer/templates ---
assert(headerSchema.safeParse({ logo: 'javascript:x' }).success === false, 'header logo scheme checked');
assert(headerSchema.safeParse({ logo_size: 99 }).success === false, 'header logo size ranged');
assert(footerSchema.safeParse({ legal: [{ label: 'T', href: 'javascript:x' }] }).success === false, 'footer legal href checked');
assert(templateSchema.safeParse({ card: { image_ratio: '9/16' } }).success === false, 'card ratio enum checked');
assert(templateSchema.safeParse({ detail: { related_count: 99 } }).success === false, 'related count ranged');
const md = mergeDisplay({ card: { radius: 8 } });
assert(md.card.radius === 8 && md.card.image_ratio === DISPLAY_DEFAULTS.card.image_ratio, 'display merge');
assert(merge(HEADER_DEFAULTS, { sticky: 'yes' }).sticky === true, 'header merge ignores mistyped values');

// --- pages ---
assert(pageSchema.safeParse({ title: 'T', slug: 'Bad Slug!', blocks: [], published: true }).success === false, 'slug format checked');
assert(validatePageSlug('about') !== null, 'reserved slug blocked');
assert(validatePageSlug('shipping-info') === null, 'normal slug ok');
assert(pageSchema.safeParse({ title: 'T', slug: 'x', blocks: [{ id: '1', type: 'button', destination: 'javascript:x' }], published: true }).success === false, 'block destination checked');

// --- products/variants ---
assert(productUpdateSchema.safeParse({ price: -5 }).success === false, 'negative price rejected');
assert(productUpdateSchema.safeParse({ slug: 'Bad Slug' }).success === false, 'slug format checked');
assert(productUpdateSchema.safeParse({ image: 'data:x' }).success === false, 'product image scheme checked');
assert(productUpdateSchema.safeParse({ unknown_key: 1 }).success === false, 'strict product schema');
assert(variantSchema.safeParse({ product_id: 'p', size: '', stock: -1 }).success === false, 'variant bounds checked');

// --- unknown sections/keys (folded in from check-section-schemas) ---
assert(parseSectionSettings('mystery', {}).ok === false, 'unknown section rejected');
const stripped = parseSectionSettings('hero', { headline: 'H', injected: 'x' });
assert(stripped.ok && !('injected' in stripped.settings), 'unknown keys stripped');

console.log('OK — cms checks passed');
