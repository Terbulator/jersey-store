export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-[#FBBF24]/15 text-[#FBBF24]',
  PROCESSING: 'bg-[#60A5FA]/15 text-[#60A5FA]',
  SHIPPED: 'bg-[#60A5FA]/15 text-[#60A5FA]',
  DELIVERED: 'bg-[#4ADE80]/15 text-[#4ADE80]',
  CANCELLED: 'bg-[#EF4444]/15 text-[#EF4444]',
  REFUNDED: 'bg-[#EF4444]/15 text-[#EF4444]',
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        STATUS_STYLES[status] ?? 'bg-[#292929] text-[#A8A8A8]'
      }`}
    >
      {status}
    </span>
  );
}

export const formInputCls = 'input w-full text-[12px]';

export const crudInputCls =
  'rounded-md border border-[#292929] bg-[#0D0D0D] px-2.5 py-1.5 text-[13px] text-[#EFECE6] placeholder:text-[#666666] focus:border-[#B3001B] focus:outline-none';

export type FormStatus = { kind: 'idle' | 'saving' | 'saved' | 'error'; message?: string };

export function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-md border border-[#292929] bg-[#111111] p-4">
      <h2 className="font-mono-meta text-[10px] text-off-white/50 uppercase tracking-[0.18em]">{title}</h2>
      {hint && <p className="-mt-1 text-[11px] text-[#666666]">{hint}</p>}
      {children}
    </section>
  );
}

export function CheckRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-2.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#B3001B]" />
      <span>
        <span className="block text-[13px] text-[#EFECE6]">{label}</span>
        {hint && <span className="block text-[11px] text-[#666666]">{hint}</span>}
      </span>
    </label>
  );
}