import { makeCrudApi } from '@/lib/admin-crud';
import { isSafeUrl } from '@/lib/section-schemas';

const NAV_SECTIONS = ['main', 'mobile', 'footer-shop', 'footer-support', 'footer-follow', 'footer-about'];

export const { POST, PATCH, DELETE } = makeCrudApi({
  table: 'navigation_items',
  fields: ['section', 'label', 'href'],
  require: 'label',
  boolFields: ['active'],
  numericFields: ['sort_order'],
  defaults: { active: true, section: 'main', sort_order: 0 },
  validate: (row) => {
    if (row.href !== undefined && !isSafeUrl(row.href)) return 'Destination URL scheme not allowed.';
    if (row.section !== undefined && !NAV_SECTIONS.includes(String(row.section))) return 'Unknown navigation section.';
    if (row.label !== undefined && !String(row.label).trim()) return 'Label cannot be empty.';
    return null;
  },
});