import { makeCrudApi } from '@/lib/admin-crud';

export const { POST, PATCH, DELETE } = makeCrudApi({
  table: 'offers',
  fields: ['title', 'subtitle', 'badge', 'code', 'discount_text', 'image', 'cta_text', 'cta_url'],
  require: 'title',
  boolFields: ['active'],
  numericFields: ['sort_order'],
  defaults: { active: true, sort_order: 0 },
});