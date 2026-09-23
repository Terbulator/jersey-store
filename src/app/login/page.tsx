'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { createClient } from '@/lib/supabase/client';
import { syncGuestData } from '@/lib/sync';
import { useAuth } from '@/components/auth/auth-provider';
import { ROUTES } from '@/lib/utils';

function errorMessage(error: { code?: string; message: string }): string {
  switch (error.code) {
    case 'invalid_credentials':
      return 'Incorrect email or password.';
    case 'email_not_confirmed':
      return 'Confirm your email address before signing in.';
    case 'rate_limited':
    case 'over_email_send_rate_limit':
      return 'Too many attempts. Try again in a moment.';
    default:
      return 'Failed to sign in. Try again.';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [redirect, setRedirect] = useState<string | null>(null);
  const [searchDone, setSearchDone] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get('redirect');
    setRedirect(target && target.startsWith('/') && !target.startsWith('//') ? target : null);
    setSearchDone(true);
  }, []);

  const home = role ? '/admin' : ROUTES.ACCOUNT;

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetch('/api/me')
      .then((r) => r.json())
      .then((j: { role?: string | null }) => {
        if (active) setRole(j.role ?? null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (searchDone && !loading && user) {
      router.replace(redirect ?? home);
    }
  }, [searchDone, loading, user, redirect, home, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { data, error: signInError } = await createClient().auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(errorMessage(signInError));
        setBusy(false);
        return;
      }
      if (data.user) {
        await syncGuestData(data.user.id);
      }
      const me = await fetch('/api/me')
        .then((r) => r.json())
        .then((j: { role?: string | null }) => j.role ?? null)
        .catch(() => null);
      router.replace(redirect ?? (me ? '/admin' : ROUTES.ACCOUNT));
      router.refresh();
    } catch {
      setError(errorMessage({ message: 'failed' }));
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect ?? ROUTES.ACCOUNT)}`,
      },
    });
  };

  return (
    <AuthShell
      brand="HEADERR."
      title={
        <>
          WELCOME
          <br />
          BACK.
        </>
      }
      sub="YOUR JERSEYS. YOUR COLLECTION. YOUR ACCOUNT."
    >
      <form onSubmit={handleSubmit}>
        <label className="block">
          <span className="font-mono-meta text-[10px] text-off-white/50 block mb-2.5">EMAIL</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-b border-off-white/25 py-3.5 text-[15px] text-off-white placeholder:text-off-white/25 outline-none focus:border-red transition-colors"
          />
        </label>

        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <span className="font-mono-meta text-[10px] text-off-white/50 block mb-2.5">PASSWORD</span>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="font-mono-meta text-[9px] text-off-white/40 hover:text-red transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-off-white/25 py-3.5 text-[15px] text-off-white placeholder:text-off-white/25 outline-none focus:border-red transition-colors"
          />
        </div>

        {error && <p className="font-mono-meta text-[10px] text-[#ff5f6d] mt-5">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="btn-pill w-full bg-[#B3001B] text-white hover:bg-[#D4002A] disabled:opacity-50 mt-10"
        >
          {busy ? 'LOGGING IN...' : 'LOG IN'}
        </button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <span className="flex-1 h-px bg-off-white/10" />
        <span className="font-mono-meta text-[9px] text-off-white/35">OR</span>
        <span className="flex-1 h-px bg-off-white/10" />
      </div>

      <button onClick={handleGoogle} className="btn-pill btn-pill-outline w-full">
        Continue with Google
      </button>

      <p className="font-mono-meta text-[9px] text-off-white/40 mt-10 text-center">
        Don&apos;t have an account?{' '}
        <Link
          href={`${ROUTES.SIGNUP}${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="text-off-white hover:text-red transition-colors"
        >
          CREATE ACCOUNT →
        </Link>
      </p>
    </AuthShell>
  );
}