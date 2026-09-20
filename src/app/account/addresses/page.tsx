'use client';

import { useState } from 'react';
import { MapPin, Home, Building2, Pencil, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal: string;
  isDefault: boolean;
};

const INITIAL_ADDRESSES: Address[] = [
  {
    id: '1',
    label: 'Home',
    name: 'Rahul Sharma',
    line1: '123 Main Street, Apartment 4B',
    line2: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal: '400001',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    name: 'Rahul Sharma',
    line1: '456 Business Park, Tower 3',
    line2: 'Sector 5, Hinjewadi',
    city: 'Pune',
    state: 'Maharashtra',
    postal: '411001',
    isDefault: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);

  const remove = (id: string) => setAddresses((prev) => prev.filter((a) => a.id !== id));

  const setDefault = (id: string) =>
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal uppercase">Addresses</h1>
          <button className="inline-flex items-center gap-2 px-6 py-3 border border-charcoal text-[11px] tracking-widest uppercase text-charcoal hover:bg-charcoal hover:text-off-white transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add Address
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white border border-charcoal/5 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {addr.label === 'Home' ? (
                    <Home className="w-4 h-4 text-chrome" />
                  ) : (
                    <Building2 className="w-4 h-4 text-chrome" />
                  )}
                  <span className="text-[11px] tracking-widest uppercase font-medium text-charcoal">{addr.label}</span>
                </div>
                {addr.isDefault && (
                  <span className="text-[10px] tracking-widest uppercase text-blood-red bg-blood-red/10 px-2 py-1">
                    Default
                  </span>
                )}
              </div>

              <div className="text-sm text-charcoal space-y-0.5 mb-4">
                <p className="font-medium">{addr.name}</p>
                <p className="text-chrome">{addr.line1}</p>
                {addr.line2 && <p className="text-chrome">{addr.line2}</p>}
                <p className="text-chrome">{addr.city}, {addr.state} {addr.postal}</p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-charcoal/5">
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefault(addr.id)}
                    className="text-[11px] tracking-widest uppercase text-chrome hover:text-blood-red transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button className="flex items-center gap-1 text-[11px] tracking-widest uppercase text-chrome hover:text-charcoal transition-colors ml-auto">
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => remove(addr.id)}
                  className="flex items-center gap-1 text-[11px] tracking-widest uppercase text-chrome hover:text-blood-red transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
