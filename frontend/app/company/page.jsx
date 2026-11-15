'use client';

import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api, errorMessage } from '@/lib/api';
import { useGuard } from '@/lib/useGuard';
import { Alert, Card, Loading, Shell, FREQUENCY_AR, LEVEL_STYLE } from '@/components/ui';

const fmtDate = (iso, weekday = false) =>
  new Date(iso).toLocaleDateString('ar-EG', {
    weekday: weekday ? 'long' : undefined,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

function nextStep(collected, target) {
  if (collected < target) return `تبقّى ${Math.ceil(target - collected)} كجم للوصول إلى التارجت`;
  const gold = Math.ceil(target * 1.5);
  if (collected < gold) return `تبقّى ${Math.ceil(gold - collected)} كجم للمستوى الذهبي`;
  return 'وصلت إلى أعلى مستوى';
}

function Row({ label, value }) {
  return (
    <p className="flex flex-wrap gap-x-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </p>
  );
}

function Dashboard({ data }) {
  const { contract, target, nextPickup } = data;
  const rawPct = Math.round((target.collectedKg / Math.max(1, target.targetKg)) * 100);
  const pct = Math.min(100, rawPct);

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-xl font-bold sm:text-2xl">{data.companyName}</h1>
            <p className="text-sm text-slate-600">
              {contract.packageName} · {FREQUENCY_AR[contract.visitFrequency]}
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-brand-dark">
            متبقي {contract.daysRemaining} يوم
          </span>
        </div>
        <p className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-600">
          العقد من {fmtDate(contract.startDate)} إلى {fmtDate(contract.endDate)}
        </p>
      </Card>

      <Card title="الزيارة القادمة">
        {nextPickup ? (
          <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Row label="الموعد:" value={fmtDate(nextPickup.scheduledDate, true)} />
              <Row label="الساعة:" value={nextPickup.timeSlot} />
              <Row label="المندوب:" value={nextPickup.collectorName} />
              <p className="rounded-lg bg-emerald-50 p-3 text-sm text-brand-dark">
                اعرض هذا الكود للمندوب عند وصوله ليمسحه ويؤكد الاستلام.
              </p>
            </div>
            <div className="mx-auto rounded-xl border border-slate-200 bg-white p-3 shadow-sm" dir="ltr">
              <QRCodeSVG value={nextPickup.qrToken} size={160} role="img" aria-label="كود QR لتأكيد التسليم" />
            </div>
          </div>
        ) : (
          <p className="text-slate-500">لا توجد زيارة مجدولة حاليًا.</p>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Card title="التارجت الشهري">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-2xl font-bold tabular-nums">
                {target.collectedKg} <span className="text-base font-normal text-slate-500">/ {target.targetKg} كجم</span>
              </span>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${LEVEL_STYLE[target.level]}`}>{target.level}</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="نسبة إنجاز التارجت"
              className="h-3 overflow-hidden rounded-full bg-slate-200"
            >
              <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-sm">
              <span className="font-bold tabular-nums">{rawPct}%</span>
              <span className="text-slate-600">{nextStep(target.collectedKg, target.targetKg)}</span>
            </div>
            <p className="mt-3 text-xs text-slate-500">يُحتسب الوزن بعد اعتماد الإدارة للشحنة.</p>
          </Card>
        </div>

        <Card title="محفظة النقاط">
          <p className="text-3xl font-bold text-gold tabular-nums">
            {data.pointsWallet.toLocaleString('en-US')} <span className="text-base font-normal text-slate-500">نقطة</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">تُضاف النقاط بعد اعتماد الإدارة للشحنة.</p>
        </Card>
      </div>
    </>
  );
}

export default function CompanyPage() {
  const { session, logout } = useGuard('company');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/company/dashboard').then(setData).catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  if (!session) return <Loading />;

  return (
    <Shell title="لوحة الشركة" user={session.user.fullname} onLogout={logout}>
      <Alert>{error}</Alert>
      {error && !data && (
        <button
          type="button"
          onClick={() => {
            setError('');
            load();
          }}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          إعادة المحاولة
        </button>
      )}
      {!data && !error && <Loading />}
      {data && <Dashboard data={data} />}
    </Shell>
  );
}