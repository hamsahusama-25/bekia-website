'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CalendarClock,
  Check,
  ChevronDown,
  Compass,
  Eye,
  EyeOff,
  Loader2,
  LocateFixed,
  Lock,
  Mail,
  MapPin,
  Phone,
  Tag,
  Truck,
  User,
} from 'lucide-react';
import { api, saveSession, errorMessage } from '@/lib/api';
import { getPosition } from '@/lib/geo';
import { HOME } from '@/lib/useGuard';
import { Alert, FREQUENCY_AR } from '@/components/ui';

const EMPTY = {
  fullname: '',
  email: '',
  phone: '',
  age: '',
  address: '',
  password: '',
  companyName: '',
  category: '',
  companyAddress: '',
  lng: '',
  lat: '',
};

const ROLES = [
  { value: 'company', label: 'شركة', icon: Building2 },
  { value: 'collector', label: 'مندوب / مجمع', icon: Truck },
];

const STEPS = {
  company: [
    ['بيانات الحساب', 'بياناتك الشخصية ووسيلة التواصل'],
    ['بيانات الشركة', 'اسم الشركة وموقعها عشان المندوب يوصلك'],
    ['الباقة والزيارات', 'اختر الباقة وعدد الزيارات المناسب لك'],
  ],
  collector: [
    ['بيانات الحساب', 'بياناتك الشخصية ووسيلة التواصل'],
    ['موافقة الإدارة', 'الحساب بيتفعّل بعد مراجعة الإدارة'],
    ['ابدأ الاستلام', 'استلم المخلفات من الشركات وسجّلها'],
  ],
};

const INPUT =
  'h-13 w-full rounded-xl border border-slate-300 bg-slate-50 pr-12 text-base text-slate-900 placeholder:text-slate-400 transition focus:border-brand focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100';

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

function Section({ step, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-brand">
          {step}
        </span>
        <h2 className="font-heading text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-slate-700">
      {children}
    </label>
  );
}

function TextField({
  label,
  icon: Icon,
  hint,
  ltr = false,
  type = 'text',
  className = '',
  ...props
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        )}
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          dir={ltr ? 'ltr' : undefined}
          className={`${INPUT} ${ltr ? 'text-right' : ''} ${isPassword ? 'pl-12' : 'pl-4'}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('company');
  const [form, setForm] = useState(EMPTY);
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packageId, setPackageId] = useState('');
  const [visitFrequency, setVisitFrequency] = useState('weekly');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const frequencyId = useId();

  useEffect(() => {
    api
      .get('/packages')
      .then((list) => {
        setPackages(list);
        if (list[0]) setPackageId(list[0].id);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setPackagesLoading(false));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function useMyLocation() {
    setLocating(true);
    setError('');
    try {
      const { lng, lat } = await getPosition();
      setForm((f) => ({ ...f, lng: lng.toFixed(6), lat: lat.toFixed(6) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLocating(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const base = {
      role,
      fullname: form.fullname,
      email: form.email,
      phone: form.phone,
      age: Number(form.age),
      address: form.address,
      password: form.password,
    };
    const body =
      role === 'company'
        ? {
            ...base,
            companyName: form.companyName,
            category: form.category,
            companyAddress: form.companyAddress,
            packageId,
            visitFrequency,
            location: { lng: Number(form.lng), lat: Number(form.lat) },
          }
        : base;
    try {
      const data = await api.post('/auth/register', body);
      saveSession(data);
      router.push(HOME[data.user.role]);
    } catch (err) {
      const first = err.details?.[0];
      setError(
        first
          ? `${errorMessage(err)} (${first.path}: ${first.message})`
          : errorMessage(err),
      );
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-3 sm:p-4">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* الفورم: أول عنصر = يمين في RTL */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mx-auto max-w-3xl">
            <Logo />

            <div className="mb-8 mt-10 space-y-2">
              <h1 className="font-heading text-3xl font-extrabold text-slate-900">
                إنشاء حساب
              </h1>
              <p className="text-base text-slate-500">
                اختر نوع الحساب ثم أكمل البيانات.
              </p>
            </div>

            {/* نوع الحساب */}
            <div
              role="tablist"
              aria-label="نوع الحساب"
              className="mb-6 grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1.5"
            >
              {ROLES.map(({ value, label, icon: Icon }) => {
                const active = role === value;
                return (
                  <button
                    key={value}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => setRole(value)}
                    className={`flex h-12 items-center justify-center gap-2 rounded-xl text-base font-bold transition-all ${
                      active
                        ? 'bg-white text-brand shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="size-5" />
                    {label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={submit} className="space-y-5">
              <Section step={1} title="بيانات المستخدم">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="الاسم بالكامل"
                    icon={User}
                    value={form.fullname}
                    onChange={set('fullname')}
                    required
                    minLength={3}
                    autoComplete="name"
                  />
                  <TextField
                    label="البريد الإلكتروني"
                    icon={Mail}
                    type="email"
                    ltr
                    value={form.email}
                    onChange={set('email')}
                    required
                    autoComplete="email"
                  />
                  <TextField
                    label="رقم الهاتف"
                    icon={Phone}
                    type="tel"
                    ltr
                    value={form.phone}
                    onChange={set('phone')}
                    required
                    hint="مثال: +201012345678"
                    autoComplete="tel"
                  />
                  <TextField
                    label="السن"
                    icon={Calendar}
                    type="number"
                    min="18"
                    max="100"
                    value={form.age}
                    onChange={set('age')}
                    required
                  />
                  <TextField
                    className="sm:col-span-2"
                    label="العنوان"
                    icon={MapPin}
                    value={form.address}
                    onChange={set('address')}
                    required
                    minLength={5}
                    autoComplete="street-address"
                  />
                  <TextField
                    className="sm:col-span-2"
                    label="كلمة المرور"
                    icon={Lock}
                    type="password"
                    ltr
                    value={form.password}
                    onChange={set('password')}
                    required
                    minLength={8}
                    hint="8 أحرف على الأقل"
                    autoComplete="new-password"
                  />
                </div>
              </Section>

              {role === 'company' && (
                <>
                  <Section step={2} title="بيانات الشركة">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField
                        label="اسم الشركة"
                        icon={Building2}
                        value={form.companyName}
                        onChange={set('companyName')}
                        required
                      />
                      <TextField
                        label="التصنيف"
                        icon={Tag}
                        value={form.category}
                        onChange={set('category')}
                        required
                        hint="مثال: مصنع، فندق، مطعم"
                      />
                      <TextField
                        className="sm:col-span-2"
                        label="عنوان الشركة"
                        icon={MapPin}
                        value={form.companyAddress}
                        onChange={set('companyAddress')}
                        required
                        minLength={5}
                      />
                      <TextField
                        label="خط الطول (Longitude)"
                        icon={Compass}
                        type="number"
                        step="any"
                        ltr
                        value={form.lng}
                        onChange={set('lng')}
                        required
                      />
                      <TextField
                        label="خط العرض (Latitude)"
                        icon={Compass}
                        type="number"
                        step="any"
                        ltr
                        value={form.lat}
                        onChange={set('lat')}
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={useMyLocation}
                      disabled={locating}
                      className="mt-4 flex h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 transition-colors hover:border-brand hover:bg-emerald-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {locating ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <LocateFixed className="size-5" />
                      )}
                      استخدم موقعي الحالي
                    </button>
                  </Section>

                  <Section step={3} title="الباقة وتكرار الزيارات">
                    {packagesLoading ? (
                      <p className="flex items-center gap-2 py-4 text-slate-500">
                        <Loader2 className="size-5 animate-spin" />
                        جاري تحميل الباقات...
                      </p>
                    ) : (
                      <fieldset className="grid gap-3 sm:grid-cols-3">
                        <legend className="sr-only">اختر الباقة</legend>
                        {packages.map((p) => {
                          const selected = packageId === p.id;
                          return (
                            <label
                              key={p.id}
                              className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-emerald-100 ${
                                selected
                                  ? 'border-brand bg-emerald-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="package"
                                className="sr-only"
                                checked={selected}
                                onChange={() => setPackageId(p.id)}
                              />
                              {selected && (
                                <span className="absolute left-3 top-3 flex size-6 items-center justify-center rounded-full bg-brand text-white">
                                  <Check className="size-4" strokeWidth={3} />
                                </span>
                              )}
                              <div className="font-heading text-lg font-bold text-slate-900">
                                {p.name}
                              </div>
                              <div className="text-sm text-slate-500">
                                {p.durationMonths} شهور
                              </div>
                              <div className="mt-3 text-xl font-extrabold text-brand">
                                {p.finalPriceEGP}{' '}
                                <span className="text-sm font-semibold">ج.م</span>
                              </div>
                              {p.discountPercent > 0 && (
                                <span className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                                  خصم {p.discountPercent}%
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </fieldset>
                    )}

                    <div className="mt-5">
                      <Label htmlFor={frequencyId}>تكرار زيارة المندوب</Label>
                      <div className="relative">
                        <CalendarClock className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                        <ChevronDown className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                        <select
                          id={frequencyId}
                          value={visitFrequency}
                          onChange={(e) => setVisitFrequency(e.target.value)}
                          className={`${INPUT} appearance-none pl-12`}
                        >
                          {Object.entries(FREQUENCY_AR).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Section>
                </>
              )}

              {role === 'collector' && (
                <Alert kind="info">
                  بعد إنشاء الحساب سترفع صورة البطاقة والفيش والتشبيه وصورة الوجه،
                  ولا يتفعل الحساب إلا بموافقة الإدارة.
                </Alert>
              )}

              <Alert>{error}</Alert>

              <button
                type="submit"
                disabled={busy || (role === 'company' && !packageId)}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  <>
                    إنشاء الحساب
                    <ArrowLeft className="size-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-base text-slate-600">
              لديك حساب؟{' '}
              <Link
                href="/login"
                className="font-bold text-brand hover:text-brand-dark hover:underline"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </section>

        {/* اللوحة الغامقة: ديسكتوب بس، ثابتة وإنت بتنزل */}
        <aside className="relative hidden self-start overflow-hidden rounded-3xl bg-emerald-950 p-10 text-white lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-2rem)] lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:24px_24px]"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-40 -left-32 size-[26rem] rounded-full bg-brand/40 blur-3xl"
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-emerald-100">
              <span className="size-2 rounded-full bg-lime-400" />
              {role === 'company' ? 'حساب شركة' : 'حساب مندوب'}
            </span>
          </div>

          <div className="relative space-y-8">
            <h2 className="font-heading text-3xl font-extrabold leading-snug">
              ابدأ مع Pickea
              <br />
              <span className="text-lime-400">في دقائق</span>
            </h2>

            <ol className="space-y-5">
              {STEPS[role].map(([title, text], i) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 font-heading font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-heading text-base font-bold">{title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-emerald-100/80">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <p className="relative text-sm text-emerald-200/80">
            © {new Date().getFullYear()} Pickea
          </p>
        </aside>
      </div>
    </main>
  );
}
