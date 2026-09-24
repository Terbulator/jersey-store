'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { ROUTES } from '@/lib/utils';

type View = 'profile' | 'settings';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [view, setView] = useState<View>('profile');
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    if (user) setName((user.user_metadata?.full_name as string | undefined) ?? '');
  }, [user]);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setRoleLoading(false);
      return;
    }
    let active = true;
    setRoleLoading(true);
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j: { role?: string | null }) => {
        if (!active) return;
        setRole(j.role ?? null);
        setRoleLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setRole(null);
        setRoleLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  if (loading || (user && roleLoading)) {
    return (
      <section className="min-h-screen bg-black flex items-center justify-center">
        <span className="w-8 h-8 border border-off-white/20 border-t-off-white rounded-full animate-spin" />
      </section>
    );
  }
  if (role === 'ADMIN') {
    router.replace('/admin');
    return null;
  }

  if (!user) {
    router.replace(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.ACCOUNT)}`);
    return null;
  }

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? '';

  const saveName = async () => {
    setSaving(true);
    await createClient().auth.updateUser({ data: { full_name: name.trim() || fullName } });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sendResetLink = async () => {
    await createClient().auth.resetPasswordForEmail(user.email!, {
      redirectTo: `${window.location.origin}${ROUTES.RESET_PASSWORD}`,
    });
    setResetSent(true);
  };

  const menu = (
    <nav className="flex md:block flex-wrap lg:space-y-0.5">
      {[
        { key: 'profile', label: 'Profile' },
        { key: 'orders', label: 'Orders', href: '/account/orders' },
        { key: 'wishlist', label: 'Wishlist', href: '/wishlist' },
        { key: 'addresses', label: 'Addresses', href: '/account/addresses' },
        { key: 'settings', label: 'Settings' },
      ].map((item) => {
        const active = !item.href && view === item.key;
        const inner = (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-0 transition-opacity" />
            <span>{item.label}</span>
          </>
        );
        const cls =
          'flex items-center gap-3 py-3.5 px-4 font-mono-meta text-[10px] tracking-[0.12em] border-b border-off-white/10 transition-colors ' +
          (active ? 'text-off-white' : 'text-off-white/45 hover:text-off-white');
        return item.href ? (
          <Link key={item.key} href={item.href} className={cls}>
            {inner}
          </Link>
        ) : (
          <button
            key={item.key}
            onClick={() => setView(item.key as View)}
            className={cn(cls, 'w-full text-left')}
          >
            {inner}
          </button>
        );
      })}
      <button
        onClick={async () => {
          await signOut();
          window.location.replace(ROUTES.HOME);
        }}
        className="w-full text-left flex items-center gap-3 py-3.5 px-4 font-mono-meta text-[10px] tracking-[0.12em] border-b border-off-white/10 text-red hover:text-[#ff5f6d] transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-0" />
        Logout
      </button>
    </nav>
  );

  return (
    <section className="min-h-screen bg-black text-off-white px-6 sm:px-8 lg:px-12 pt-28 lg:pt-32 pb-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-end justify-between border-b border-off-white/10 pb-8 mb-10">
          <h1 className="font-display text-5xl sm:text-6xl text-off-white">ACCOUNT</h1>
          <span className="font-mono-meta text-[10px] text-off-white/40 hidden sm:block">
            {user.email}
          </span>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-10 lg:gap-16 items-start">
          <div>{menu}</div>

          <div className="max-w-[560px]">
            {view === 'profile' ? (
              <>
                <h2 className="font-display text-3xl text-off-white mb-1">
                  HI, {firstName(fullName)}.
                </h2>
                <p className="font-mono-meta text-[10px] text-off-white/45 mb-10">
                  MANAGE YOUR PROFILE
                </p>

                <label className="block">
                  <span className="font-mono-meta text-[10px] text-off-white/50 block mb-2.5">
                    NAME
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSaved(false);
                    }}
                    className="w-full bg-transparent border-b border-off-white/25 py-3.5 text-[15px] text-off-white outline-none focus:border-red transition-colors"
                  />
                </label>

                <label className="block mt-8">
                  <span className="font-mono-meta text-[10px] text-off-white/50 block mb-2.5">
                    EMAIL
                  </span>
                  <input
                    type="email"
                    readOnly
                    value={user.email ?? ''}
                    className="w-full bg-transparent border-b border-off-white/25 py-3.5 text-[15px] text-off-white/50 outline-none cursor-not-allowed"
                  />
                </label>

                <div className="flex items-center gap-6 mt-10">
                  <button
                    onClick={saveName}
                    disabled={saving}
                    className="btn-pill btn-pill-solid disabled:opacity-50"
                  >
                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                  {saved && (
                    <span className="font-mono-meta text-[10px] text-off-white/60">SAVED.</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-3xl text-off-white mb-1">SETTINGS</h2>
                <p className="font-mono-meta text-[10px] text-off-white/45 mb-10">
                  SECURITY & ACCOUNT
                </p>

                <button onClick={sendResetLink} className="btn-pill btn-pill-outline">
                  Send Password Reset Link
                </button>
                {resetSent && (
                  <p className="font-mono-meta text-[10px] text-off-white/60 mt-5">
                    RESET LINK SENT. CHECK YOUR EMAIL.
                  </p>
                )}

                <div className="mt-12 pt-8 border-t border-off-white/10">
                  <p className="font-mono-meta text-[10px] text-off-white/40 mb-4">
                    SIGN OUT OF THIS DEVICE
                  </p>
                  <button
                    onClick={async () => {
                      await signOut();
                      window.location.replace(ROUTES.HOME);
                    }}
                    className="btn-pill btn-pill-outline text-red border-red/50 hover:bg-red hover:text-white"
                  >
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function firstName(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.split(' ')[0] : 'Champion';
}