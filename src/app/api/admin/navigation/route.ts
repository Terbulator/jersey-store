import { makeCrudApi } from '@/lib/admin-crud';

export const { POST, PATCH, DELETE } = makeCrudApi({
  table: 'navigation_items',
  fields: ['section', 'label', 'href'],
  require: 'label',
  boolFields: ['active'],
  numericFields: ['sort_order'],
  defaults: { active: true, section: 'main', sort_order: 0 },
});