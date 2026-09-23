import { makeCrudApi } from '@/lib/admin-crud';

export const { POST, PATCH, DELETE } = makeCrudApi({
  table: 'banners',
  fields: ['name', 'eyebrow', 'headline', 'copy', 'image', 'cta_text', 'cta_url'],
  require: 'name',
  boolFields: ['active'],
  numericFields: ['sort_order'],
  defaults: { active: true, sort_order: 0 },
});