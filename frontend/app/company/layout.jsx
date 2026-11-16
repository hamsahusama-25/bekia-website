'use client';

import { useGuard } from '@/lib/useGuard';
import { Loading } from '@/components/ui';
import AppShell from '@/components/layout/AppShell';
import { COMPANY_LINKS } from '@/lib/nav';

export default function CompanyLayout({ children }) {
  const { session, logout } = useGuard('company');

  if (!session) return <Loading />;

  return (
    <AppShell title="لوحة الشركة" user={session.user.fullname} onLogout={logout} links={COMPANY_LINKS}>
      {children}
    </AppShell>
  );
}