import { adminDataClient } from '@/lib/admin';
import { ShippingForm } from './shipping-form';

export const metadata = { title: 'Shipping — HEADERR Admin' };

export default async function AdminShippingPage() {
  const sb = await adminDataClient();
  const { data } = await sb
    .from('site_settings')
    .select('value')
    .eq('key', 'shipping')
    .maybeSingle();
  const value = (data?.value ?? {}) as { free_threshold?: number; rate?: number; message?: string };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Shipping</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">Checkout pricing rules</p>
      </div>
      <ShippingForm initial={value} />
    </div>
  );
}