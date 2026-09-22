'use client';

import type { ReactNode } from 'react';

interface AuthShellProps {
  brand: string;
  title: ReactNode;
  sub: string;
  children: ReactNode;
}

export function AuthShell({ brand, title, sub, children }: AuthShellProps) {
  return (
    <section className="min-h-screen bg-black text-off-white flex items-center px-6 sm:px-8 lg:px-12 pt-24 lg:pt-20 pb-16">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-14 lg:gap-24 items-center lg:min-h-[70vh]">
          <div className="hidden lg:block">
            <p className="font-mono-meta text-[10px] text-off-white/40 mb-10">{brand}</p>
            <h1 className="font-display text-[92px] xl:text-[108px] leading-[0.9] tracking-[-0.02em] text-off-white">
              {title}
            </h1>
            <div className="mt-12 w-16 h-px bg-red" />
            <p className="font-mono-meta text-[11px] text-off-white/50 mt-12 leading-[2.1]">
              {sub}
            </p>
          </div>

          <div className="lg:max-w-[440px] w-full">
            <div className="lg:hidden mb-10">
              <p className="headline text-2xl text-off-white mb-3">HEADERR.</p>
              <h1 className="font-display text-[44px] leading-[0.95] text-off-white">{title}</h1>
              <p className="font-mono-meta text-[10px] text-off-white/40 mt-5 leading-[2]">{sub}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}