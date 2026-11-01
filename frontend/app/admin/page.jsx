'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '@/lib/api';
import { useGuard } from '@/lib/useGuard';
import { Alert, Button, Card, Empty, Field, Loading, Shell, STATUS_AR, TRASH_AR } from '@/components/ui';

const TABS = [
  ['overview', 'نظرة عامة'],
  ['collectors', 'المندوبون'],
  ['pickups', 'الشحنات'],
  ['schedule', 'الجدولة'],
  ['packages', 'الباقات'],
];

/** Fetches a private file with the admin token and shows it inline (an <img src> cannot send headers). */
function PrivateImage({ name, label }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let objectUrl;
    api
      .getBlob(`/files/${name}`)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => setError('تعذر تحميل الصورة'));
    return () => objectUrl && URL.revokeObjectURL(objectUrl);
  }, [name]);
  if (error) return <span className="text-xs text-alert">{error}</span>;
  if (!url) return <span className="text-xs text-slate-500">...</span>;
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={label} className="h-28 w-28 rounded-lg border object-cover" />
      <figcaption className="text-center text-xs text-slate-600">{label}</figcaption>
    </figure>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/admin/stats').then(setStats).catch((e) => setError(errorMessage(e)));
  }, []);
  if (error) return <Alert>{error}</Alert>;
  if (!stats) return <Loading />;
  const kpis = [
    ['الشركات التي تمت خدمتها', stats.companiesServed],
    ['إجمالي الوزن (كجم)', stats.totalWeightKg],
    ['طلبات جارية', stats.activeOrders],
    ['مندوبون في انتظار الموافقة', stats.pendingCollectors],
    ['حالات عدم استجابة', stats.noShows],
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {kpis.map(([label, value]) => (
          <Card key={label}>
            <p className="text-2xl font-bold text-brand">{value}</p>
            <p className="text-xs text-slate-600">{label}</p>
          </Card>
        ))}
      </div>
      <Card title={`الوزن حسب النوع (${stats.month})`}>
        {Object.keys(stats.weightByType).length === 0 ? (
          <Empty>لا توجد شحنات معتمدة هذا الشهر.</Empty>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-4">
            {Object.entries(stats.weightByType).map(([type, kg]) => (
              <li key={type} className="rounded-lg bg-slate-50 p-3">
                <span className="font-bold">{kg}</span> كجم · {TRASH_AR[type]}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Collectors() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(() => api.get('/admin/collectors').then(setList).catch((e) => setError(errorMessage(e))), []);
  useEffect(() => {
    load();
  }, [load]);

  async function approve(id) {
    setError('');
    try {
      await api.patch(`/admin/collectors/${id}/approve`, {});
      setNotice('تم قبول المندوب كموظف');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (!list) return error ? <Alert>{error}</Alert> : <Loading />;
  return (
    <div className="space-y-3">
      <Alert kind="success">{notice}</Alert>
      <Alert>{error}</Alert>
      {list.length === 0 && <Empty>لا يوجد مندوبون مسجلون.</Empty>}
      {list.map((c) => (
        <Card key={c.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold">{c.fullname}</p>
              <p className="text-sm text-slate-600" dir="ltr">
                {c.email} · {c.phone}
              </p>
              <p className="text-sm text-slate-600">
                {c.age} سنة · {c.address}
              </p>
              <p className="mt-1 text-sm">
                {c.isApprovedByAdmin ? '✅ معتمد' : c.documentsComplete ? '⏳ في انتظار القبول' : '📄 المستندات غير مكتملة'}
              </p>
            </div>
            {!c.isApprovedByAdmin && (
              <Button onClick={() => approve(c.id)} disabled={!c.documentsComplete}>
                قبول كموظف
              </Button>
            )}
          </div>
          {c.documentsComplete && !c.isApprovedByAdmin && (
            <div className="mt-3 flex flex-wrap gap-3">
              <PrivateImage name={c.documents.nationalId} label="البطاقة" />
              <PrivateImage name={c.documents.criminalRecord} label="الفيش والتشبيه" />
              <PrivateImage name={c.documents.faceId} label="الوجه" />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function Pickups() {
  const [status, setStatus] = useState('PENDING_REVIEW');
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(() => {
    setList(null);
    return api.get(`/admin/pickups?status=${status}`).then(setList).catch((e) => setError(errorMessage(e)));
  }, [status]);
  useEffect(() => {
    load();
  }, [load]);

  async function approve(id) {
    setError('');
    try {
      const r = await api.post(`/admin/pickups/${id}/approve`);
      setNotice(`تم الاعتماد: ${r.totalWeightKg} كجم، +${r.pointsAwarded} نقطة، مستوى الشركة ${r.targetLevel}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="فلتر الحالة">
        {Object.entries(STATUS_AR).map(([value, label]) => (
          <button
            key={value}
            aria-pressed={status === value}
            onClick={() => setStatus(value)}
            className={`rounded-full border px-3 py-1 text-sm ${status === value ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <Alert kind="success">{notice}</Alert>
      <Alert>{error}</Alert>
      {!list && !error && <Loading />}
      {list && list.length === 0 && <Empty>لا توجد شحنات بهذه الحالة.</Empty>}
      {list?.map((p) => (
        <Card key={p.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold">{p.companyName}</p>
              <p className="text-sm text-slate-600">
                {p.scheduledDate} · {p.timeSlot} · المندوب: {p.collectorName}
              </p>
              {p.items && (
                <p className="text-sm">
                  {p.items.map((i) => `${TRASH_AR[i.trashType]} ${i.weightKg} كجم`).join(' + ')} = <b>{p.totalWeightKg} كجم</b>
                </p>
              )}
              {p.pointsAwarded !== undefined && <p className="text-sm text-gold">+{p.pointsAwarded} نقطة</p>}
              {p.noShowDistanceMeters !== undefined && <p className="text-sm text-slate-600">تم التحقق: المندوب على بعد {p.noShowDistanceMeters} م من الشركة</p>}
            </div>
            {p.status === 'PENDING_REVIEW' && <Button onClick={() => approve(p.id)}>اعتماد الشحنة</Button>}
          </div>
          {p.scalePhoto && (
            <div className="mt-3">
              <PrivateImage name={p.scalePhoto} label="صورة الميزان" />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function Schedule() {
  const [companies, setCompanies] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [form, setForm] = useState({ companyId: '', collectorId: '', scheduledDate: new Date().toISOString().slice(0, 10), timeSlot: '09:00' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    Promise.all([api.get('/admin/companies'), api.get('/admin/collectors?status=approved')])
      .then(([c, k]) => {
        setCompanies(c);
        setCollectors(k);
        setForm((f) => ({ ...f, companyId: c[0]?.id || '', collectorId: k[0]?.id || '' }));
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      await api.post('/admin/pickups', form);
      setNotice('تمت الجدولة وتم إنشاء كود QR للشركة');
    } catch (err) {
      setError(err.code === 'COLLECTOR_NOT_APPROVED' || err.code === 'DUPLICATE' ? (err.code === 'DUPLICATE' ? 'هذه الشركة محجوزة بالفعل في نفس الموعد' : errorMessage(err)) : err.message);
    }
  }

  const select = (label, key, options) => (
    <Field label={label}>
      {(id) => (
        <select id={id} value={form[key]} onChange={set(key)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" required>
          {options.map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
      )}
    </Field>
  );

  return (
    <Card title="توزيع شركة على مندوب">
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        {select('الشركة', 'companyId', companies.map((c) => [c.id, `${c.companyName} — ${c.address}`]))}
        {select('المندوب', 'collectorId', collectors.map((c) => [c.id, c.fullname]))}
        <Field label="التاريخ" type="date" value={form.scheduledDate} onChange={set('scheduledDate')} required />
        <Field label="الساعة" type="time" value={form.timeSlot} onChange={set('timeSlot')} required />
        <div className="space-y-2 sm:col-span-2">
          <Alert kind="success">{notice}</Alert>
          <Alert>{error}</Alert>
          <Button type="submit" disabled={!form.companyId || !form.collectorId}>
            جدولة الزيارة
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Packages() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(() => api.get('/packages').then(setList).catch((e) => setError(errorMessage(e))), []);
  useEffect(() => {
    load();
  }, [load]);

  async function save(e, id) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError('');
    try {
      await api.put(`/admin/packages/${id}`, { priceEGP: Number(data.get('price')), discountPercent: Number(data.get('discount')) });
      setNotice('تم حفظ التعديلات');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (!list) return error ? <Alert>{error}</Alert> : <Loading />;
  return (
    <div className="space-y-3">
      <Alert kind="success">{notice}</Alert>
      <Alert>{error}</Alert>
      {list.map((p) => (
        <Card key={p.id} title={`${p.name} — ${p.durationMonths} شهور`}>
          <form onSubmit={(e) => save(e, p.id)} className="flex flex-wrap items-end gap-3">
            <Field label="السعر (ج.م)" name="price" type="number" min="0" defaultValue={p.priceEGP} required />
            <Field label="الخصم %" name="discount" type="number" min="0" max="100" defaultValue={p.discountPercent} required />
            <Button type="submit">حفظ</Button>
          </form>
        </Card>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const { session, logout } = useGuard('admin');
  const [tab, setTab] = useState('overview');
  if (!session) return <Loading />;

  return (
    <Shell title="لوحة الإدارة" user={session.user.fullname} onLogout={logout} wide>
      <nav role="tablist" aria-label="أقسام الإدارة" className="flex flex-wrap gap-2">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`rounded-lg border px-4 py-2 font-medium ${tab === value ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white'}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === 'overview' && <Overview />}
      {tab === 'collectors' && <Collectors />}
      {tab === 'pickups' && <Pickups />}
      {tab === 'schedule' && <Schedule />}
      {tab === 'packages' && <Packages />}
    </Shell>
  );
}
