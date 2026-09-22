interface Props {
  title: string;
  description?: string;
}

export function AdminInProgress({ title, description }: Props) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl text-[#EFECE6]">{title}</h1>
      <p className="mt-0.5 text-[12px] text-[#A8A8A8]">{description ?? 'This module is on the roadmap and will be built next.'}</p>
      <div className="mt-6 rounded-md border border-dashed border-[#292929] bg-[#111111] p-10 text-center">
        <p className="text-[13px] text-[#666666]">Coming soon.</p>
      </div>
    </div>
  );
}