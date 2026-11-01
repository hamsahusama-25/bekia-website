'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from './api';

export const HOME = { company: '/company', collector: '/collector', admin: '/admin' };

/**
 * Redirects to /login when there is no session, or to the user's own page when the role is wrong.
 * The backend enforces roles as well; this only avoids showing a page that would just fail.
 */
export function useGuard(role) {
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const s = getSession();
    if (!s) router.replace('/login');
    else if (s.user.role !== role) router.replace(HOME[s.user.role] || '/login');
    else setSession(s);
  }, [role, router]);

  const logout = () => {
    clearSession();
    router.replace('/login');
  };

  return { session, logout };
}
