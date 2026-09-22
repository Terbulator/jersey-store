'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthShell } from '@/components/auth/auth-shell';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [searchDone, setSearchDone] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSearchDone(true);
  }, []);

  useEffect(() => {
    if (searchDone && !loading && user) {
      router.replace(ROUTES.ACCOUNT);
    }
  }, [searchDone, loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setBusy(false);

    // Always report success — never reveal whether an account exists.
    if (resetError && resetError.code === 'over_email_send_rate_limit') {
      setError('Too many requests. Try again in a moment.');
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell
      brand="HEADERR."
      title={
        <>
          RESET YOUR
          <br />
          PASSWORD.
        </>
      }
      sub="NO WORRIES. WE'LL GET YOU BACK IN."
    >
      {sent ? (
        <div>
          <p className="headline text-4xl text-off-white">CHECK YOUR EMAIL.</p>
          <p className="font-mono-meta text-[10px] text-off-white/50 mt-6 leading-[2]">
            WE&apos;VE SENT YOU A PASSWORD RESET LINK.
          </p>
          <Link href={ROUTES.LOGIN} className="btn-pill btn-pill-outline mt-10 inline-flex">
            Back to Log In
          </Link>
        </div>
      ) : (
        <>
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

            {error && <p className="font-mono-meta text-[10px] text-[#ff5f6d] mt-5">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="btn-pill w-full bg-[#B3001B] text-white hover:bg-[#D4002A] disabled:opacity-50 mt-10"
            >
              {busy ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
          </form>

          <p className="font-mono-meta text-[9px] text-off-white/40 mt-10 text-center">
            Remembered it?{' '}
            <Link href={ROUTES.LOGIN} className="text-off-white hover:text-red transition-colors">
              LOG IN →
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}