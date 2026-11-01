'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, saveSession, errorMessage } from '@/lib/api';
import { HOME } from '@/lib/useGuard';
import { Alert, Button, Card, Field } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api.post('/auth/login', { identifier, password });
      saveSession(data);
      router.push(HOME[data.user.role]);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="mb-1 text-center text-3xl font-bold text-brand">Loop Eco</h1>
      <p className="mb-6 text-center text-slate-600">منصة إدارة المخلفات وإعادة التدوير للشركات</p>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Field
            label="البريد الإلكتروني أو رقم الهاتف أو اسم المستخدم"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
            dir="ltr"
          />
          <Field
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            dir="ltr"
          />
          <Alert>{error}</Alert>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'جاري الدخول...' : 'دخول'}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="font-medium text-brand underline">
          إنشاء حساب
        </Link>
      </p>
    </main>
  );
}
