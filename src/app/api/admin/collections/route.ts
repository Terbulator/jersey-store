import { makeCrudApi } from '@/lib/admin-crud';

export const { POST, PATCH, DELETE } = makeCrudApi({
  table: 'collections',
  fields: ['name', 'slug', 'description', 'image'],
  require: 'name',
  boolFields: ['active'],
  numericFields: ['sort_order'],
  defaults: { active: true, sort_order: 0 },
});