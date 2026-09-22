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