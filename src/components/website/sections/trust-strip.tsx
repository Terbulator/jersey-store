const DEFAULT_ITEMS = [
  'FREE SHIPPING OVER ₹999',
  '30-DAY RETURNS',
  'PLAYER & MASTER EDITIONS',
  'OFFICIAL 2026 KITS',
  'NEW DROPS EVERY FRIDAY',
  'PREMIUM FABRICS',
];

interface TrustSettings { items?: string[] }

export function TrustStrip({ settings }: { settings?: TrustSettings | null }) {
  const items = settings?.items?.length ? settings.items : DEFAULT_ITEMS;
  const track = [...items, ...items];

  return (
    <section className="border-y border-white/10 bg-navy py-5 overflow-hidden">
      <div className="marquee">
        <div className="marquee-track flex items-center gap-10 whitespace-nowrap">
          {track.map((item, i) => (
            <span key={i} className="font-mono-meta text-[10px] tracking-[0.25em] text-off-white/60 flex items-center gap-10">
              {item} <span className="text-red">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
