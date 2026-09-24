'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordField } from '@/components/auth/password-field';
import { createClient } from '@/lib/supabase/client';
import { ROUTES } from '@/lib/utils';

function errorMessage(error: { code?: string; message: string }): string {
  switch (error.code) {
    case 'weak_password':
      return 'Password must be at least 6 characters.';
    case 'over_request_rate_limit':
      return 'Too many attempts. Try again in a moment.';
    case 'session_not_found':
    case 'invalid_session':
      return 'This reset link has expired. Please request a new one.';
    default:
      return 'Could not update password. Try again.';
  }
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const type = searchParams.get('type');
    const code = searchParams.get('code');
    const hasRecoveryParams = type === 'recovery' || !!code;

    if (hasRecoveryParams) {
      setIsRecovery(true);
    } else {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }: { data: { session: { type?: string } | null } }) => {
        if (session && session.type === 'recovery') {
          setIsRecovery(true);
        }
      });
    }
    setChecked(true);
  }, [searchParams]);

  if (!checked) {
    return (
      <section className="min-h-screen bg-black flex items-center justify-center px-6">
        <span className="w-8 h-8 border border-off-white/20 border-t-off-white rounded-full animate-spin" />
      </section>
    );
  }

  if (!isRecovery) {
    return (
      <AuthShell
        brand="HEADERR."
        title={
          <>
            RESET
            <br />
            PASSWORD.
          </>
        }
        sub="THIS LINK IS INVALID OR HAS EXPIRED."
      >
        <div className="text-center">
          <p className="font-mono-meta text-[10px] text-off-white/50 mb-6">
            NO ACTIVE PASSWORD RECOVERY SESSION FOUND.
          </p>
          <Link href={ROUTES.FORGOT_PASSWORD} className="btn-pill btn-pill-outline inline-flex">
            Request New Reset Link
          </Link>
        </div>
      </AuthShell>
    );
  }

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
    const { error: updateError } = await createClient().auth.updateUser({
      password,
    });
    setBusy(false);

    if (updateError) {
      setError(errorMessage(updateError));
      return;
    }

    setSuccess(true);
  };

  return (
    <AuthShell
      brand="HEADERR."
      title={
        <>
          SET NEW
          <br />
          PASSWORD.
        </>
      }
      sub="YOUR RECOVERY LINK IS VERIFIED."
    >
      {success ? (
        <div>
          <p className="headline text-4xl text-off-white">PASSWORD UPDATED.</p>
          <p className="font-mono-meta text-[10px] text-off-white/50 mt-6 leading-[2]">
            YOU CAN NOW LOG IN WITH YOUR NEW PASSWORD.
          </p>
          <Link href={ROUTES.LOGIN} className="btn-pill btn-pill-solid mt-10 inline-flex">
            Log In
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <label className="block">
              <span className="font-mono-meta text-[10px] text-off-white/50 block mb-2.5">NEW PASSWORD</span>
              <PasswordField
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                required
                ariaLabel="New password"
                placeholder="Enter new password"
              />
            </label>

            <label className="block mt-8">
              <span className="font-mono-meta text-[10px] text-off-white/50 block mb-2.5">CONFIRM PASSWORD</span>
              <PasswordField
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
                required
                ariaLabel="Confirm password"
                placeholder="Confirm new password"
              />
            </label>

            {error && <p className="font-mono-meta text-[10px] text-[#ff5f6d] mt-5">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="btn-pill w-full bg-[#B3001B] text-white hover:bg-[#D4002A] disabled:opacity-50 mt-10"
            >
              {busy ? 'UPDATING...' : 'UPDATE PASSWORD'}
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