'use client';

import { useState } from 'react';

export interface DestinationOption {
  value: string;
  label: string;
}

const PRESETS: { id: string; label: string; href: string }[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'shop', label: 'Shop', href: '/shop' },
  { id: 'football', label: 'Football', href: '/shop/football' },
  { id: 'cricket', label: 'Cricket', href: '/shop/cricket' },
  { id: 'streetwear', label: 'Streetwear', href: '/shop/streetwear' },
  { id: 'new', label: 'New Arrivals', href: '/shop/new-arrivals' },
  { id: 'sale', label: 'Sale', href: '/shop/sale' },
  { id: 'bundle', label: 'Bundle', href: '/bundle' },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'culture', label: 'Culture', href: '/culture' },
  { id: 'search', label: 'Search', href: '/search' },
  { id: 'wishlist', label: 'Wishlist', href: '/wishlist' },
  { id: 'cart', label: 'Cart', href: '/cart' },
];

type Sel = 'preset' | 'product' | 'page' | 'external' | 'custom';

function detect(value: string, products: DestinationOption[], pages: DestinationOption[]): { sel: Sel; preset: string } {
  if (PRESETS.some((p) => p.href === value)) return { sel: 'preset', preset: value };
  if (value.startsWith('/shop/products/') && products.some((p) => p.value === value)) return { sel: 'product', preset: '' };
  if (pages.some((p) => p.value === value)) return { sel: 'page', preset: '' };
  if (/^https?:\/\//i.test(value)) return { sel: 'external', preset: '' };
  if (value) return { sel: 'custom', preset: '' };
  return { sel: 'preset', preset: '/' };
}

import { crudInputCls as inputCls } from '@/lib/admin-ui';

// Friendly link picker: presets, products, pages, external URLs, or an
// advanced custom path. Raw javascript:/data: URLs are never offered and are
// rejected again server-side.
export function DestinationInput({
  value,
  onChange,
  products = [],
  pages = [],
}: {
  value: string;
  onChange: (href: string) => void;
  products?: DestinationOption[];
  pages?: DestinationOption[];
}) {
  const detected = detect(value, products, pages);
  const [sel, setSel] = useState<Sel>(detected.sel);
  const [text, setText] = useState(value);

  function pick(s: Sel, href: string) {
    setSel(s);
    setText(href);
    onChange(href);
  }

  return (
    <div className="space-y-1.5">
      <select
        value={sel}
        onChange={(e) => {
          const s = e.target.value as Sel;
          if (s === 'preset') pick(s, '/');
          else if (s === 'product') pick(s, products[0]?.value ?? value);
          else if (s === 'page') pick(s, pages[0]?.value ?? value);
          else pick(s, value);
        }}
        className={`${inputCls} w-full`}
        aria-label="Destination type"
      >
        <option value="preset">Page on this site</option>
        {products.length > 0 && <option value="product">Product</option>}
        {pages.length > 0 && <option value="page">Page</option>}
        <option value="external">External URL</option>
        <option value="custom">Custom path (advanced)</option>
      </select>

      {sel === 'preset' && (
        <select
          value={PRESETS.some((p) => p.href === value) ? value : '/'}
          onChange={(e) => pick('preset', e.target.value)}
          className={`${inputCls} w-full`}
          aria-label="Destination page"
        >
          {PRESETS.map((p) => (
            <option key={p.id} value={p.href}>
              {p.label}
            </option>
          ))}
        </select>
      )}
      {sel === 'product' && products.length > 0 && (
        <select
          value={products.some((p) => p.value === value) ? value : products[0].value}
          onChange={(e) => pick('product', e.target.value)}
          className={`${inputCls} w-full`}
          aria-label="Destination product"
        >
          {products.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      )}
      {sel === 'page' && pages.length > 0 && (
        <select
          value={pages.some((p) => p.value === value) ? value : pages[0].value}
          onChange={(e) => pick('page', e.target.value)}
          className={`${inputCls} w-full`}
          aria-label="Destination content page"
        >
          {pages.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      )}
      {sel === 'external' && (
        <input
          value={/^https?:\/\//i.test(text) ? text : ''}
          placeholder="https://…"
          onChange={(e) => {
            setText(e.target.value);
            onChange(e.target.value);
          }}
          className={`${inputCls} w-full`}
          aria-label="External URL"
        />
      )}
      {sel === 'custom' && (
        <input
          value={text}
          placeholder="/custom-path"
          onChange={(e) => {
            setText(e.target.value);
            onChange(e.target.value);
          }}
          className={`${inputCls} w-full`}
          aria-label="Custom path"
        />
      )}
      <p className="truncate text-[10px] text-[#666666]">Links to: {value || '—'}</p>
    </div>
  );
}
