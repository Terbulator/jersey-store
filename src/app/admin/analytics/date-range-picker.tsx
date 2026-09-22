'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

export function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    if (fromParam) setFrom(fromParam);
    if (toParam) setTo(toParam);
  }, [searchParams]);

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    if (from) params.set('from', from);
    else params.delete('from');
    if (to) params.set('to', to);
    else params.delete('to');
    router.push(`/admin/analytics?${params.toString()}`);
  }

  function clear() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('from');
    params.delete('to');
    router.push(`/admin/analytics?${params.toString()}`);
  }

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1.5 text-[11px] text-[#A8A8A8]">
        <Calendar className="h-3.5 w-3.5" />
        <span>Range</span>
      </label>
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="rounded-md border border-[#292929] bg-[#0D0D0D] px-2.5 py-1.5 text-[12px] text-[#EFECE6] focus:border-[#B3001B] focus:outline-none w-36"
      />
      <span className="text-[#666666]">–</span>
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="rounded-md border border-[#292929] bg-[#0D0D0D] px-2.5 py-1.5 text-[12px] text-[#EFECE6] focus:border-[#B3001B] focus:outline-none w-36"
      />
      <button onClick={apply} className="rounded-md bg-[#B3001B] px-3 py-1.5 text-[11px] font-semibold text-[#EFECE6]">
        Apply
      </button>
      {(from || to) && (
        <button onClick={clear} className="rounded-md border border-[#292929] px-2.5 py-1.5 text-[11px] text-[#A8A8A8] hover:border-[#3a3a3a]">
          Clear
        </button>
      )}
    </div>
  );
}