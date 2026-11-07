
'use client';

import { useEffect, useState } from 'react';

import { api, errorMessage } from '@/lib/api';

import {
  Alert,
  Button,
  Card,
  Field,
  Loading,
} from '@/components/ui';

import {
  Building2,
  Truck,
  CalendarDays,
  Clock,
  ClipboardCheck,
  QrCode,
  CalendarCheck,
} from 'lucide-react';

export default function Schedule() {
  const [companies, setCompanies] = useState([]);
  const [collectors, setCollectors] = useState([]);

  const [form, setForm] = useState({
    companyId: '',
    collectorId: '',
    scheduledDate: new Date().toISOString().slice(0, 10),
    timeSlot: '09:00',
  });

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/admin/companies'),
      api.get('/admin/collectors?status=approved'),
    ])
      .then(([c, k]) => {
        setCompanies(c);
        setCollectors(k);

        setForm((f) => ({
          ...f,
          companyId: c[0]?.id || '',
          collectorId: k[0]?.id || '',
        }));
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => {
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
    }));
  };

  async function submit(e) {
    e.preventDefault();

    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      await api.post('/admin/pickups', form);

      setNotice('تمت الجدولة بنجاح وإنشاء كود QR للشركة');
    } catch (err) {
      setError(
        err.code === 'COLLECTOR_NOT_APPROVED' ||
        err.code === 'DUPLICATE'
          ? err.code === 'DUPLICATE'
            ? 'هذه الشركة محجوزة بالفعل في نفس الموعد'
            : errorMessage(err)
          : err.message
      );
    } finally {
      setSubmitting(false);
    }
  }

  const select = (label, key, options) => (
    <Field label={label}>
      {(id) => (
        <select
          id={id}
          value={form[key]}
          onChange={set(key)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          required
        >
          <option value="">اختر {label}</option>

          {options.map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
      )}
    </Field>
  );

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <CalendarCheck size={25} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              جدولة الشحنات
            </h1>

            <p className="text-sm text-slate-500">
              توزيع الشركات على المندوبين وتحديد مواعيد جمع المخلفات
            </p>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Building2 size={22} />
          </div>

          <div>
            <p className="text-sm text-slate-500">الشركات المسجلة</p>
            <p className="text-xl font-bold text-slate-800">
              {companies.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Truck size={22} />
          </div>

          <div>
            <p className="text-sm text-slate-500">المندوبون المعتمدون</p>
            <p className="text-xl font-bold text-slate-800">
              {collectors.length}
            </p>
          </div>
        </div>

      </div>

      {/* Schedule Form */}
      <Card className="border border-slate-200 shadow-sm">

        <div className="mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={21} className="text-emerald-600" />

            <h2 className="text-lg font-bold text-slate-800">
              بيانات الزيارة
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            اختاري الشركة والمندوب ثم حددي موعد الزيارة.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">

          {/* Company & Collector */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-700">
              أولاً: تحديد الأطراف
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Building2 size={17} className="text-emerald-600" />
                  الشركة
                </div>

                {select(
                  'الشركة',
                  'companyId',
                  companies.map((c) => [
                    c.id,
                    `${c.companyName} — ${c.address}`,
                  ])
                )}

                {companies.length === 0 && (
                  <p className="text-xs text-red-500">
                    لا توجد شركات مسجلة.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Truck size={17} className="text-emerald-600" />
                  المندوب
                </div>

                {select(
                  'المندوب',
                  'collectorId',
                  collectors.map((c) => [c.id, c.fullname])
                )}

                {collectors.length === 0 && (
                  <p className="text-xs text-red-500">
                    لا يوجد مندوبون معتمدون.
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Date & Time */}
          <div className="border-t border-slate-100 pt-5">

            <h3 className="mb-3 text-sm font-bold text-slate-700">
              ثانياً: تحديد موعد الزيارة
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <CalendarDays size={17} className="text-emerald-600" />
                  تاريخ الزيارة
                </div>

                <Field
                  type="date"
                  value={form.scheduledDate}
                  onChange={set('scheduledDate')}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Clock size={17} className="text-emerald-600" />
                  وقت الزيارة
                </div>

                <Field
                  type="time"
                  value={form.timeSlot}
                  onChange={set('timeSlot')}
                  required
                />
              </div>

            </div>
          </div>

          {/* Notifications */}
          {notice && (
            <Alert kind="success">
              {notice}
            </Alert>
          )}

          {error && <Alert>{error}</Alert>}

          {/* Submit */}
          <div className="border-t border-slate-100 pt-5">
            <Button
              type="submit"
              block
              disabled={
                !form.companyId ||
                !form.collectorId ||
                submitting ||
                companies.length === 0 ||
                collectors.length === 0
              }
            >
              <span className="flex items-center justify-center gap-2">
                <QrCode size={19} />
                {submitting ? 'جاري الجدولة...' : 'تأكيد الجدولة وإنشاء QR'}
              </span>
            </Button>

            <p className="mt-3 text-center text-xs text-slate-400">
              سيتم إنشاء كود QR للشركة بعد نجاح عملية الجدولة.
            </p>
          </div>

        </form>
      </Card>

    </div>
  );
}
