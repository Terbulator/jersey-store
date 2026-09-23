'use client';

import { useEffect, useState } from 'react';

const inputClass =
  'w-full rounded-md border border-[#292929] bg-[#0D0D0D] px-3 py-2 text-[13px] text-[#EFECE6] placeholder:text-[#666666] focus:border-[#B3001B] focus:outline-none';

export default function AdminSettingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [contact, setContact] = useState({ email: '', phone: '', address: '' });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load settings.');
        if (data.settings?.contact) setContact(data.settings.contact);
        setLoaded(true);
      })
      .catch(() => setError('Could not load settings.'));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Could not save.');
      setSaved(true);
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Settings</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">Store-wide configuration. Shipping lives in System → Shipping.</p>
      </div>

      {!loaded && !error && <p className="text-[13px] text-[#666666]">Loading…</p>}

      <form onSubmit={save} className="space-y-8 rounded-md border border-[#292929] bg-[#111111] p-5">
        {!loaded && error && <p className="text-[12px] text-[#EF4444]">{error}</p>}

        <section className="space-y-4">
          <h2 className="text-[13px] font-semibold text-[#EFECE6]">Contact</h2>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-widest text-[#A8A8A8]">Support email</label>
              <input className={inputClass} type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-widest text-[#A8A8A8]">Phone</label>
              <input className={inputClass} value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-widest text-[#A8A8A8]">Address</label>
              <textarea className={inputClass} rows={2} value={contact.address} onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))} />
            </div>
          </div>
        </section>

        {error && loaded && <p className="text-[12px] text-[#EF4444]">{error}</p>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={!loaded || saving} className="rounded-md bg-[#B3001B] px-4 py-2 text-[12px] font-semibold text-[#EFECE6] transition-opacity hover:opacity-90 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          {saved && <span className="text-[12px] text-[#4ADE80]">Saved.</span>}
        </div>
      </form>
    </div>
  );
}
