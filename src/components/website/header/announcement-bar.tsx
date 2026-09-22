'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const FALLBACK_MESSAGES = [
  'FREE SHIPPING OVER ₹999',
  '30-DAY RETURNS',
  'PLAYER VERSION & MASTER EDITION',
  'OFFICIAL KITS — 2026 SEASON',
];

export function AnnouncementBar() {
  const [messages, setMessages] = useState<string[]>(FALLBACK_MESSAGES);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from('announcements')
      .select('text')
      .order('sort_order', { ascending: true })
      .then(({ data }: { data: Array<{ text: string }> | null }) => {
        if (cancelled) return;
        const texts = (data ?? []).map((a) => a.text).filter(Boolean) as string[];
        if (texts.length) setMessages(texts);
      })
      .catch(() => {
        // fall back to hardcoded messages on any failure
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 5000);
    return () => clearInterval(id);
  }, [messages]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-black border-b border-white/10">
      <div className="h-full flex items-center justify-center overflow-hidden px-4">
        <span
          key={index}
          className="announcement-track font-mono-meta text-[10px] text-off-white/80"
        >
          {messages[index]}
        </span>
      </div>
    </div>
  );
}