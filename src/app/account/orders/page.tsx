'use client';

import Link from 'next/link';
import { Package, ChevronRight, Eye } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

const ORDERS = [
  {
    id: 'HDR-20260915-X7K2M1',
    date: 'Sep 15, 2026',
    items: [
      { name: 'Brazil 2026', size: 'L', qty: 1, price: 2499 },
      { name: 'Argentina 2026', size: 'M', qty: 1, price: 2499 },
    ],
    total: 4998,
    status: 'Delivered',
  },
  {
    id: 'HDR-20260910-P9N4Q2',
    date: 'Sep 10, 2026',
    items: [
      { name: 'Real Madrid 2026', size: 'XL', qty: 1, price: 3499 },
    ],
    total: 3499,
    status: 'Shipped',
  },
  {
    id: 'HDR-20260908-R3T5W1',
    date: 'Sep 8, 2026',
    items: [
      { name: 'HEADERR Oversized Tee', size: 'M', qty: 2, price: 1499 },
      { name: 'HEADERR Hoodie', size: 'L', qty: 1, price: 2999 },
    ],
    total: 5997,
    status: 'Processing',
  },
];

const STATUS_STYLES: Record<string, string> = {
  Delivered: 'bg-green-50 text-green-700 border-green-200',
  Shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  Processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

export default function OrdersPage() {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal uppercase">Orders</h1>
        </div>

        <div className="space-y-4">
          {ORDERS.map((order) => (
            <div key={order.id} className="bg-white border border-charcoal/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-charcoal/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-chrome" />
                    <span className="text-sm font-medium text-charcoal">{order.id}</span>
                  </div>
                  <p className="text-[11px] tracking-wider text-chrome">{order.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'text-[10px] tracking-widest uppercase px-3 py-1.5 border',
                    STATUS_STYLES[order.status]
                  )}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-3 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-charcoal">
                        {item.name} <span className="text-chrome">x{item.qty}</span>
                        <span className="text-chrome ml-2">Size: {item.size}</span>
                      </span>
                      <span className="text-charcoal font-medium">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-charcoal/5">
                  <span className="text-sm font-bold text-charcoal">Total: {formatPrice(order.total)}</span>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-blood-red hover:text-charcoal transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Order
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
