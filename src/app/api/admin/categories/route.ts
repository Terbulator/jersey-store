import { makeCrudApi } from '@/lib/admin-crud';

export const { POST, PATCH, DELETE } = makeCrudApi({
  table: 'categories',
  fields: ['name', 'slug', 'image', 'label', 'description'],
  write: 'content:write',
  remove: 'content:delete',
  read: 'content:read',
  require: 'name',
  numericFields: ['sort_order'],
  defaults: { sort_order: 0 },
});