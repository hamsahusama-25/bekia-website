'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api, errorMessage } from '@/lib/api';
import { useGuard } from '@/lib/useGuard';
import { Alert, Card, Loading, Shell, FREQUENCY_AR, LEVEL_STYLE } from '@/components/ui';

const fmtDate = (iso) => new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

export default function CompanyPage() {
  const { session, logout } = useGuard('company');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;
    api.get('/company/dashboard').then(setData).catch((e) => setError(errorMessage(e)));
  }, [session]);

  if (!session) return <Loading />;
  const pct = data ? Math.min(100, Math.round((data.target.collectedKg / Math.max(1, data.target.targetKg)) * 100)) : 0;

  return (
    <Shell title="لوحة الشركة" user={session.user.fullname} onLogout={logout}>
      <Alert>{error}</Alert>
      {!data && !error && <Loading />}
      {data && (
        <>
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold">{data.companyName}</h1>
                <p className="text-sm text-slate-600">
                  {data.contract.packageName} · {FREQUENCY_AR[data.contract.visitFrequency]}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-brand-dark">
                متبقي {data.contract.daysRemaining} يوم
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              العقد من {fmtDate(data.contract.startDate)} إلى {fmtDate(data.contract.endDate)}
            </p>
          </Card>

          <Card title="التارجت الشهري">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-2xl font-bold">
                {data.target.collectedKg} <span className="text-base font-normal text-slate-500">/ {data.target.targetKg} كجم</span>
              </span>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${LEVEL_STYLE[data.target.level]}`}>{data.target.level}</span>
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
            <p className="mt-2 text-xs text-slate-500">يُحتسب الوزن بعد اعتماد الإدارة للشحنة.</p>
          </Card>

          <Card title="محفظة النقاط">
            <p className="text-3xl font-bold text-gold">{data.pointsWallet} نقطة</p>
          </Card>

          <Card title="الزيارة القادمة">
            {data.nextPickup ? (
              <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
                <div className="space-y-1">
                  <p>
                    <span className="text-slate-500">الموعد:</span> {data.nextPickup.scheduledDate} الساعة {data.nextPickup.timeSlot}
                  </p>
                  <p>
                    <span className="text-slate-500">المندوب:</span> {data.nextPickup.collectorName}
                  </p>
                  <p className="text-sm text-slate-600">اعرض هذا الكود للمندوب عند وصوله ليمسحه ويؤكد الاستلام.</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3" dir="ltr">
                  <QRCodeSVG value={data.nextPickup.qrToken} size={160} role="img" aria-label="كود QR لتأكيد التسليم" />
                </div>
              </div>
            ) : (
              <p className="text-slate-500">لا توجد زيارة مجدولة حاليًا.</p>
            )}
          </Card>
        </>
      )}
    </Shell>
  );
}
