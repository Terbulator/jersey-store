const steps = [
  { label: 'ORDER PLACED', completed: true },
  { label: 'CONFIRMED', completed: true },
  { label: 'PACKED', completed: true },
  { label: 'SHIPPED', current: true },
  { label: 'OUT FOR DELIVERY', completed: false },
  { label: 'DELIVERED', completed: false },
];

export function OrderTimeline() {
  return (
    <div className="relative">
      <div className="flex justify-between">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-col items-center relative">
            <div className={`w-3 h-3 rounded-full border-2 ${step.completed ? 'bg-blood-red border-blood-red' : step.current ? 'bg-off-white border-blood-red' : 'border-charcoal/20'}`} />
            <span className={`text-[10px] tracking-wider uppercase mt-2 ${step.completed || step.current ? 'text-charcoal' : 'text-chrome'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute top-1.5 left-[5%] right-[5%] h-0.5 bg-charcoal/10 -translate-y-1/2">
        <div className="h-full w-[60%] bg-blood-red" />
      </div>
    </div>
  );
}