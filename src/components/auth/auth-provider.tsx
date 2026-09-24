'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  firstName: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  firstName: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    supabase.auth
      .getUser()
      .then(({ data }: { data: { user: User | null } }) => {
        if (!active) return;
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (!active) return;
        if (event === 'PASSWORD_RECOVERY') {
          setUser(session?.user ?? null);
          setLoading(false);
          return;
        }
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await createClient().auth.signOut();
  }, []);

  const rawName = (user?.user_metadata?.full_name as string | undefined)?.trim();
  const firstName = rawName ? rawName.split(' ')[0] : null;

  return (
    <AuthContext.Provider value={{ user, loading, firstName, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);