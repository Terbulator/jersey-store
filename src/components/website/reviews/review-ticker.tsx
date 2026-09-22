const MESSAGES = [
  'Quality Checked',
  'Tracked Shipping',
  'Secure Packaging',
  'Premium Jerseys',
  'Customer Support',
];

export function ReviewTicker() {
  const row = [...MESSAGES, ...MESSAGES];
  return (
    <div
      aria-hidden="true"
      className="marquee bg-off-white text-black"
      style={{ height: 48 }}
    >
      <div className="marquee-track font-sans font-medium text-[13px] sm:text-[14px] uppercase tracking-[0.14em] leading-none">
        {row.map((msg, i) => (
          <span key={i} className="flex items-center gap-6 pr-6">
            <span>{msg}</span>
            <span className="text-red">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}