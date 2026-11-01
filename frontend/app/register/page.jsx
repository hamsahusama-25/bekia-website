'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, saveSession, errorMessage } from '@/lib/api';
import { getPosition } from '@/lib/geo';
import { HOME } from '@/lib/useGuard';
import { Alert, Button, Card, Field, FREQUENCY_AR } from '@/components/ui';

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

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('company');
  const [form, setForm] = useState(EMPTY);
  const [packages, setPackages] = useState([]);
  const [packageId, setPackageId] = useState('');
  const [visitFrequency, setVisitFrequency] = useState('weekly');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get('/packages')
      .then((list) => {
        setPackages(list);
        if (list[0]) setPackageId(list[0].id);
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function useMyLocation() {
    try {
      const { lng, lat } = await getPosition();
      setForm((f) => ({ ...f, lng: lng.toFixed(6), lat: lat.toFixed(6) }));
    } catch (err) {
      setError(err.message);
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
      setError(first ? `${errorMessage(err)} (${first.path}: ${first.message})` : errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-center text-3xl font-bold text-brand">إنشاء حساب</h1>
      <p className="mb-6 text-center text-slate-600">اختر نوع الحساب ثم أكمل البيانات</p>

      <div role="tablist" aria-label="نوع الحساب" className="mb-4 grid grid-cols-2 gap-2">
        {[
          ['company', 'شركة'],
          ['collector', 'مندوب / مجمع'],
        ].map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={role === value}
            type="button"
            onClick={() => setRole(value)}
            className={`rounded-lg border px-4 py-2 font-medium ${
              role === value ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Card title="بيانات المستخدم">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="الاسم بالكامل" value={form.fullname} onChange={set('fullname')} required minLength={3} />
            <Field label="البريد الإلكتروني" type="email" value={form.email} onChange={set('email')} required dir="ltr" />
            <Field label="رقم الهاتف" type="tel" value={form.phone} onChange={set('phone')} required dir="ltr" hint="مثال: +201012345678" />
            <Field label="السن" type="number" min="18" max="100" value={form.age} onChange={set('age')} required />
            <div className="sm:col-span-2">
              <Field label="العنوان" value={form.address} onChange={set('address')} required minLength={5} />
            </div>
            <div className="sm:col-span-2">
              <Field label="كلمة المرور" type="password" value={form.password} onChange={set('password')} required minLength={8} dir="ltr" hint="8 أحرف على الأقل" />
            </div>
          </div>
        </Card>

        {role === 'company' && (
          <>
            <Card title="بيانات الشركة">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="اسم الشركة" value={form.companyName} onChange={set('companyName')} required />
                <Field label="التصنيف" value={form.category} onChange={set('category')} required hint="مثال: مصنع، فندق، مطعم" />
                <div className="sm:col-span-2">
                  <Field label="عنوان الشركة" value={form.companyAddress} onChange={set('companyAddress')} required minLength={5} />
                </div>
                <Field label="خط الطول (Longitude)" type="number" step="any" value={form.lng} onChange={set('lng')} required dir="ltr" />
                <Field label="خط العرض (Latitude)" type="number" step="any" value={form.lat} onChange={set('lat')} required dir="ltr" />
              </div>
              <Button type="button" variant="ghost" onClick={useMyLocation} className="mt-3">
                استخدم موقعي الحالي
              </Button>
            </Card>

            <Card title="الباقة وتكرار الزيارات">
              <fieldset className="grid gap-3 sm:grid-cols-3">
                <legend className="sr-only">اختر الباقة</legend>
                {packages.map((p) => (
                  <label
                    key={p.id}
                    className={`cursor-pointer rounded-lg border p-3 ${packageId === p.id ? 'border-brand bg-emerald-50' : 'border-slate-300'}`}
                  >
                    <input type="radio" name="package" className="sr-only" checked={packageId === p.id} onChange={() => setPackageId(p.id)} />
                    <div className="font-bold">{p.name}</div>
                    <div className="text-sm text-slate-600">{p.durationMonths} شهور</div>
                    <div className="mt-1 text-lg font-bold text-brand">{p.finalPriceEGP} ج.م</div>
                    {p.discountPercent > 0 && <div className="text-xs text-gold">خصم {p.discountPercent}%</div>}
                  </label>
                ))}
              </fieldset>
              <div className="mt-3">
                <Field label="تكرار زيارة المندوب">
                  {(id) => (
                    <select id={id} value={visitFrequency} onChange={(e) => setVisitFrequency(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
                      {Object.entries(FREQUENCY_AR).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>
            </Card>
          </>
        )}

        {role === 'collector' && (
          <Alert kind="info">بعد إنشاء الحساب سترفع صورة البطاقة والفيش والتشبيه وصورة الوجه، ولا يتفعل الحساب إلا بموافقة الإدارة.</Alert>
        )}

        <Alert>{error}</Alert>
        <Button type="submit" disabled={busy || (role === 'company' && !packageId)} className="w-full">
          {busy ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        لديك حساب؟{' '}
        <Link href="/login" className="font-medium text-brand underline">
          تسجيل الدخول
        </Link>
      </p>
    </main>
  );
}
