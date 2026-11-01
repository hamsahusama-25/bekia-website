'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '@/lib/api';
import { getPosition } from '@/lib/geo';
import { useGuard } from '@/lib/useGuard';
import QrScanner, { qrScanSupported } from '@/components/QrScanner';
import { Alert, Button, Card, Empty, Field, Loading, Shell, TRASH_AR } from '@/components/ui';

function DocumentsForm({ onDone }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setStatus(await api.postForm('/collector/documents', new FormData(e.currentTarget)));
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const rows = [
    ['nationalId', 'صورة البطاقة الشخصية'],
    ['criminalRecord', 'صورة الفيش والتشبيه'],
    ['faceId', 'صورة الوجه (Face ID)'],
  ];

  return (
    <Card title="مستندات التعيين">
      <p className="mb-3 text-sm text-slate-600">ارفع المستندات الثلاثة (JPG أو PNG أو WebP حتى 5 ميجابايت). لا يتفعل حسابك إلا بعد موافقة الإدارة.</p>
      <form onSubmit={submit} className="space-y-3">
        {rows.map(([name, label]) => (
          <Field key={name} label={label} hint={status?.[name] ? 'تم الرفع ✓' : undefined}>
            {(id) => <input id={id} name={name} type="file" accept="image/jpeg,image/png,image/webp" className="w-full text-sm" />}
          </Field>
        ))}
        <Alert>{error}</Alert>
        <Button type="submit" disabled={busy}>
          {busy ? 'جاري الرفع...' : 'رفع المستندات'}
        </Button>
      </form>
    </Card>
  );
}

function PickupPanel({ stop, onClose, onDone }) {
  const [qrToken, setQrToken] = useState('');
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState([{ trashType: 'plastic', weightKg: '' }]);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onScan = useCallback((value) => {
    setQrToken(value);
    setScanning(false);
  }, []);

  const update = (i, patch) => setItems((list) => list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const usedTypes = items.map((i) => i.trashType);
  const nextType = Object.keys(TRASH_AR).find((t) => !usedTypes.includes(t));

  async function submit(e) {
    e.preventDefault();
    if (!photo) {
      setError('صورة الميزان مطلوبة');
      return;
    }
    setBusy(true);
    setError('');
    const form = new FormData();
    form.append('qrToken', qrToken.trim());
    form.append('items', JSON.stringify(items.map((i) => ({ trashType: i.trashType, weightKg: Number(i.weightKg) }))));
    form.append('scalePhoto', photo);
    try {
      await api.postForm(`/pickups/${stop.pickupId}/complete`, form);
      onDone('تم تسجيل الاستلام وهو الآن في انتظار اعتماد الإدارة');
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <Field label="كود QR الخاص بالشركة" hint="امسح الكود من شاشة الشركة أو اكتبه يدويًا">
        {(id) => (
          <div className="flex gap-2">
            <input id={id} value={qrToken} onChange={(e) => setQrToken(e.target.value)} required dir="ltr" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            {qrScanSupported() && (
              <Button type="button" variant="ghost" onClick={() => setScanning(true)}>
                مسح
              </Button>
            )}
          </div>
        )}
      </Field>
      {scanning && <QrScanner onResult={onScan} onClose={() => setScanning(false)} />}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">نوع المخلفات والوزن</legend>
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <select
              aria-label="نوع المخلفات"
              value={it.trashType}
              onChange={(e) => update(i, { trashType: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-2 py-2"
            >
              {Object.entries(TRASH_AR).map(([value, label]) => (
                <option key={value} value={value} disabled={usedTypes.includes(value) && value !== it.trashType}>
                  {label}
                </option>
              ))}
            </select>
            <input
              aria-label="الوزن بالكيلوجرام"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="كجم"
              value={it.weightKg}
              onChange={(e) => update(i, { weightKg: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              dir="ltr"
            />
            {items.length > 1 && (
              <Button type="button" variant="ghost" aria-label="حذف السطر" onClick={() => setItems((l) => l.filter((_, idx) => idx !== i))}>
                ✕
              </Button>
            )}
          </div>
        ))}
        {nextType && (
          <Button type="button" variant="ghost" onClick={() => setItems((l) => [...l, { trashType: nextType, weightKg: '' }])}>
            + إضافة نوع آخر
          </Button>
        )}
      </fieldset>

      <Field label="صورة الميزان (إجباري)">
        {(id) => <input id={id} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(e) => setPhoto(e.target.files?.[0] || null)} className="w-full text-sm" />}
      </Field>

      <Alert>{error}</Alert>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'جاري الإرسال...' : 'تأكيد الاستلام'}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

export default function CollectorPage() {
  const { session, logout } = useGuard('collector');
  const [me, setMe] = useState(null);
  const [route, setRoute] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loadingRoute, setLoadingRoute] = useState(false);

  const loadMe = useCallback(() => api.get('/collector/me').then(setMe).catch((e) => setError(errorMessage(e))), []);

  const loadRoute = useCallback(async () => {
    setLoadingRoute(true);
    setError('');
    try {
      const pos = await getPosition();
      setRoute(await api.get(`/collector/smartroute?lng=${pos.lng}&lat=${pos.lat}`));
    } catch (err) {
      setError(err.message && !err.code ? err.message : errorMessage(err));
    } finally {
      setLoadingRoute(false);
    }
  }, []);

  useEffect(() => {
    if (session) loadMe();
  }, [session, loadMe]);

  useEffect(() => {
    if (me?.isApprovedByAdmin) loadRoute();
  }, [me, loadRoute]);

  async function reportNoShow(stop) {
    if (!window.confirm(`تسجيل أن "${stop.companyName}" مغلقة أو لا تستجيب؟ سيتم التحقق من موقعك.`)) return;
    setError('');
    try {
      const pos = await getPosition();
      await api.post(`/pickups/${stop.pickupId}/no-show`, pos);
      setNotice('تم تسجيل عدم الاستجابة وإبلاغ الإدارة');
      loadRoute();
    } catch (err) {
      setError(err.message && !err.code ? err.message : errorMessage(err));
    }
  }

  if (!session || !me) return <Loading />;

  return (
    <Shell title="شاشة المندوب" user={session.user.fullname} onLogout={logout}>
      <Alert kind="success">{notice}</Alert>
      <Alert>{error}</Alert>

      {!me.isApprovedByAdmin && (
        <>
          <Alert kind="info">حسابك في انتظار موافقة الإدارة. {me.documentsComplete ? 'تم رفع كل المستندات، وجاري مراجعتها.' : 'ارفع المستندات المطلوبة أولًا.'}</Alert>
          <DocumentsForm onDone={loadMe} />
        </>
      )}

      {me.isApprovedByAdmin && (
        <>
          {route && (
            <Card title="تارجت الشهر">
              <p className="text-2xl font-bold">
                {route.progress.completedCompaniesThisMonth}{' '}
                <span className="text-base font-normal text-slate-500">/ {route.progress.monthlyCompanyTarget} شركة</span>
              </p>
            </Card>
          )}

          <Card title="مسار اليوم (الأقرب أولًا)">
            <Button variant="ghost" onClick={loadRoute} disabled={loadingRoute} className="mb-3">
              {loadingRoute ? 'جاري التحديث...' : 'تحديث المسار من موقعي'}
            </Button>
            {route && route.stops.length === 0 && <Empty>لا توجد شركات مجدولة لك اليوم.</Empty>}
            <ol className="space-y-3">
              {route?.stops.map((stop, i) => (
                <li key={stop.pickupId} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold">
                        {i + 1}. {stop.companyName}
                      </p>
                      <p className="text-sm text-slate-600">{stop.address}</p>
                      <p className="text-sm text-slate-600">
                        الموعد {stop.timeSlot} · يبعد {stop.distanceMeters >= 1000 ? `${(stop.distanceMeters / 1000).toFixed(1)} كم` : `${stop.distanceMeters} م`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setOpenId(openId === stop.pickupId ? null : stop.pickupId)}>استلام</Button>
                      <Button variant="danger" onClick={() => reportNoShow(stop)}>
                        مغلقة / لا استجابة
                      </Button>
                    </div>
                  </div>
                  {openId === stop.pickupId && (
                    <PickupPanel
                      stop={stop}
                      onClose={() => setOpenId(null)}
                      onDone={(msg) => {
                        setOpenId(null);
                        setNotice(msg);
                        loadRoute();
                      }}
                    />
                  )}
                </li>
              ))}
            </ol>
          </Card>
        </>
      )}
    </Shell>
  );
}
