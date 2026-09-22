'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/auth-provider';
import { ROUTES } from '@/lib/utils';

function errorMessage(error: { code?: string; message: string }): string {
  switch (error.code) {
    case 'user_already_exists':
      return 'An account with this email already exists. Sign in instead.';
    case 'weak_password':
      return 'Password must be at least 6 characters.';
    case 'email_not_confirmed':
      return 'Check your email to confirm your account.';
    case 'over_request_rate_limit':
      return 'Too many attempts. Try again in a moment.';
    default:
      return 'Could not create your account. Try again.';
  }
}

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [redirect, setRedirect] = useState<string | null>(null);
  const [searchDone, setSearchDone] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get('redirect');
    setRedirect(target && target.startsWith('/') && !target.startsWith('//') ? target : null);
    setSearchDone(true);
  }, []);

  useEffect(() => {
    if (searchDone && !loading && user) {
      router.replace(redirect ?? ROUTES.ACCOUNT);
    }
  }, [searchDone, loading, user, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    const { data, error: signUpError } = await createClient().auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    });
    setBusy(false);

    if (signUpError) {
      setError(errorMessage(signUpError));
      return;
    }

    if (!data.session) {
      // Confirm-your-email flow is enabled on this project.
      setSent(true);
      return;
    }

    router.replace(redirect ?? ROUTES.ACCOUNT);
    router.refresh();
  };

  return (
    <AuthShell
      brand="HEADERR."
      title={
        <>
          JOIN THE
          <br />
          CULTURE.
        </>
      }
      sub="YOUR JERSEYS. YOUR COLLECTION. YOUR ACCOUNT."
    >
      {sent ? (
        <div>
          <p className="headline text-4xl text-off-white">CHECK YOUR EMAIL.</p>
          <p className="font-mono-meta text-[10px] text-off-white/50 mt-6 leading-[2]">
            WE&apos;VE SENT YOU A CONFIRMATION LINK.
            <br />
            YOUR ACCOUNT IS ACTIVATED AFTER YOU CLICK IT.
          </p>
          <Link href={ROUTES.LOGIN} className="btn-pill btn-pill-outline mt-10 inline-flex">
            Back to Log In
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <label className="block">
              <span className="font-mono-meta text-[10px] text-off-white/50 block mb-2.5">NAME</span>
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b border-off-white/25 py-3.5 text-[15px] text-off-white placeholder:text-off-white/25 outline-none focus:border-red transition-colors"
              />
            </label>

            <label className="block mt-8">
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

            <label className="block mt-8">
              <span className="font-mono-meta text-[10px] text-off-white/50 block mb-2.5">PASSWORD</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-off-white/25 py-3.5 text-[15px] text-off-white placeholder:text-off-white/25 outline-none focus:border-red transition-colors"
              />
            </label>

            <label className="block mt-8">
              <span className="font-mono-meta text-[10px] text-off-white/50 block mb-2.5">
                CONFIRM PASSWORD
              </span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-transparent border-b border-off-white/25 py-3.5 text-[15px] text-off-white placeholder:text-off-white/25 outline-none focus:border-red transition-colors"
              />
            </label>

            {error && <p className="font-mono-meta text-[10px] text-[#ff5f6d] mt-5">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="btn-pill w-full bg-[#B3001B] text-white hover:bg-[#D4002A] disabled:opacity-50 mt-10"
            >
              {busy ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <span className="flex-1 h-px bg-off-white/10" />
            <span className="font-mono-meta text-[9px] text-off-white/35">OR</span>
            <span className="flex-1 h-px bg-off-white/10" />
          </div>

          <button
            onClick={() =>
              createClient().auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect ?? ROUTES.ACCOUNT)}`,
                },
              })
            }
            className="btn-pill btn-pill-outline w-full"
          >
            Continue with Google
          </button>

          <p className="font-mono-meta text-[9px] text-off-white/40 mt-10 text-center">
            Already have an account?{' '}
            <Link
              href={`${ROUTES.LOGIN}${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="text-off-white hover:text-red transition-colors"
            >
              LOG IN →
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}