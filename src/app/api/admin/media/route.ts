import { makeCrudApi } from '@/lib/admin-crud';

export const { POST, PATCH, DELETE } = makeCrudApi({
  table: 'media_assets',
  fields: ['url', 'file_name', 'mime_type', 'alt'],
  require: 'url',
  numericFields: ['size_bytes'],
  defaults: { kind: 'image' },
});