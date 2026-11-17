'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  CalendarCheck,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
} from 'lucide-react';
import { api, saveSession, errorMessage } from '@/lib/api';
import { HOME } from '@/lib/useGuard';
import { Alert } from '@/components/ui';

function Logo({ light = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
          light ? 'bg-white/10 text-white' : 'bg-emerald-50 text-brand'
        }`}
      >
        <svg viewBox="0 0 40 40" fill="none" className="size-9" aria-hidden="true">
          <path d="M30.5 13.5A12.5 12.5 0 0 0 8 17" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M8 9.5V17h7.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 26.5A12.5 12.5 0 0 0 32 23" stroke="#84CC16" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M32 30.5V23h-7.5" stroke="#84CC16" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 25c-5-5 0-12 8-13-1 8-5 13-8 13Z" fill="#10B981" />
        </svg>
      </div>
      <span
        className={`font-heading text-2xl font-extrabold ${
          light ? 'text-white' : 'text-slate-900'
        }`}
      >
        Pickea
      </span>
    </div>
  );
}

/* الحقل dir=ltr بس النص متظبط يمين (text-right) عشان يطلع مظبوط في صفحة عربي.
   الأيقونة على اليمين (right) وزرار العين على الشمال (left). */
const INPUT =
  'h-13 w-full rounded-xl border border-slate-300 bg-slate-50 text-right text-base text-slate-900 placeholder:text-slate-400 transition focus:border-brand focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100';

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="font-heading text-lg font-bold text-white">{value}</p>
      <p className="text-sm text-emerald-100/80">{label}</p>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen bg-slate-50 p-3 sm:p-4">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl gap-4 sm:min-h-[calc(100vh-2rem)] lg:grid-cols-2">
        {/* الفورم: أول عنصر = يمين في RTL */}
        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <Logo />

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-md">
              <div className="mb-8 space-y-2">
                <h1 className="font-heading text-3xl font-extrabold text-slate-900">
                  تسجيل الدخول
                </h1>
                <p className="text-base text-slate-500">
                  أهلاً بيك، ادخل بياناتك عشان تكمّل.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label
                    htmlFor="identifier"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    البريد الإلكتروني أو رقم الهاتف أو اسم المستخدم
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="identifier"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete="username"
                      required
                      dir="ltr"
                      className={`${INPUT} pl-4 pr-12`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      dir="ltr"
                      className={`${INPUT} pl-12 pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={
                        showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
                      }
                      className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Alert>{error}</Alert>

                <button
                  type="submit"
                  disabled={busy}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      جاري الدخول...
                    </>
                  ) : (
                    <>
                      دخول
                      <ArrowLeft className="size-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-base text-slate-600">
                ليس لديك حساب؟{' '}
                <Link
                  href="/register"
                  className="font-bold text-brand hover:text-brand-dark hover:underline"
                >
                  إنشاء حساب
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* اللوحة الغامقة: ديسكتوب بس */}
        <aside className="relative hidden flex-col justify-between overflow-hidden rounded-3xl bg-emerald-950 p-10 text-white lg:flex">
          <div
            aria-hidden="true"
            className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:24px_24px]"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-40 -left-32 size-[28rem] rounded-full bg-brand/40 blur-3xl"
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-emerald-100">
              <span className="size-2 rounded-full bg-lime-400" />
              منصة إدارة المخلفات وإعادة التدوير للشركات
            </span>
          </div>

          <div className="relative space-y-8">
            <h2 className="font-heading text-4xl font-extrabold leading-snug xl:text-5xl xl:leading-snug">
              حوّل مخلفات شركتك
              <br />
              <span className="text-lime-400">لنقاط وقيمة حقيقية</span>
            </h2>

            {/* كارت محفظة النقاط (شكل توضيحي) */}
            <div className="max-w-sm rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-emerald-100/80">رصيد النقاط</p>
                  <p className="font-heading text-4xl font-extrabold">1,250</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-sm font-bold text-amber-300">
                  <Award className="size-4" />
                  Gold
                </span>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-2/3 rounded-full bg-lime-400" />
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <CalendarCheck className="size-5 text-lime-300" />
                <span className="text-sm font-medium text-emerald-50">
                  الاستلام القادم: الأحد، 10 صباحاً
                </span>
              </div>
            </div>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            <Stat value="10 نقاط" label="لكل كيلو" />
            <Stat value="3 مستويات" label="برونز، فضي، ذهبي" />
            <Stat value="رمز تحقق" label="لتسليم آمن" />
          </div>
        </aside>
      </div>
    </main>
  );
}