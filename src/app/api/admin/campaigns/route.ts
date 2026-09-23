import { makeCrudApi } from '@/lib/admin-crud';

export const { POST, PATCH, DELETE } = makeCrudApi({
  table: 'campaigns',
  fields: ['name', 'description', 'image', 'cta_text', 'cta_url', 'status'],
  require: 'name',
  boolFields: ['active'],
  numericFields: ['sort_order'],
  defaults: { active: true, status: 'draft', sort_order: 0 },
});