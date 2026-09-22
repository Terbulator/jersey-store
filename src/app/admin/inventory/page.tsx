import { requireAdmin, adminDataClient } from '@/lib/admin';
import { InventoryManager } from './inventory-manager';

export const metadata = { title: 'Inventory — HEADERR Admin' };

export interface VariantRow {
  id: string;
  size: string;
  sku: string | null;
  price: number | null;
  stock: number;
  low_stock_threshold: number;
  product_id: string;
  product_name: string;
  product_slug: string;
  published: boolean;
}

export default async function AdminInventoryPage() {
  await requireAdmin();
  const sb = await adminDataClient();
  const { data, error } = await sb
    .from('product_variants')
    .select('id, size, sku, price, stock, low_stock_threshold, product_id, products(slug, name, published)')
    .order('stock', { ascending: true });

  const variants: VariantRow[] = (data ?? []).map((v: any) => ({
    id: v.id,
    size: v.size,
    sku: v.sku,
    price: v.price,
    stock: v.stock,
    low_stock_threshold: v.low_stock_threshold,
    product_id: v.product_id,
    product_name: v.products?.name ?? 'Unknown',
    product_slug: v.products?.slug ?? '',
    published: v.products?.published ?? false,
  }));

  const lowCount = variants.filter((v) => v.stock <= v.low_stock_threshold).length;
  const totalUnits = variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Inventory</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">
          {variants.length} variants · {totalUnits} units · {lowCount} low-stock
        </p>
      </div>
      {error && <p className="text-[12px] text-[#EF4444]">Could not load inventory.</p>}
      <InventoryManager variants={variants} />
    </div>
  );
}