'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/api';
import { HOME } from '@/lib/useGuard';
import { Loading } from '@/components/ui';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const s = getSession();
    router.replace(s ? HOME[s.user.role] || '/landing' : '/landing');
  }, [router]);
  return <Loading />;
}
