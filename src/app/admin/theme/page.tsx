import { requireAdmin, adminDataClient } from '@/lib/admin';
import { getTheme } from '@/lib/theme';
import { ThemeForm } from './theme-form';

export const metadata = { title: 'Theme — HEADERR Admin' };

export default async function AdminThemePage() {
  await requireAdmin();
  const theme = await getTheme(await adminDataClient());

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#EFECE6]">Theme</h1>
        <p className="mt-0.5 text-[12px] text-[#A8A8A8]">
          Global colors, typography, shape, and spacing. Saving applies site-wide immediately —
          every publish and theme save is versioned, so you can always roll back.
        </p>
      </div>
      <ThemeForm initialTheme={theme} />
    </div>
  );
}
