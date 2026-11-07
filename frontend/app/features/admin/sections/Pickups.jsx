
'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '@/lib/api';

import {
  Alert,
  Button,
  Card,
  Empty,
  Loading,
  STATUS_AR,
  TRASH_AR,
} from '@/components/ui';

import PrivateImage from '@/components/admin/PrivateImage';

import {
  CalendarDays,
  Clock3,
  Building2,
  Truck,
  Weight,
  Award,
  MapPin,
  PackageCheck,
  Image as ImageIcon,
} from 'lucide-react';

export default function Pickups() {
  const [status, setStatus] = useState('PENDING_REVIEW');
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    setList(null);
    setError('');

    return api
      .get(`/admin/pickups?status=${status}`)
      .then(setList)
      .catch((e) => setError(errorMessage(e)));
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(id) {
    setError('');
    setNotice('');

    try {
      const r = await api.post(`/admin/pickups/${id}/approve`);

      setNotice(
        `تم اعتماد الشحنة بنجاح: ${r.totalWeightKg} كجم، +${r.pointsAwarded} نقطة، مستوى الشركة ${r.targetLevel}`
      );

      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          إدارة الشحنات
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          متابعة الشحنات ومراجعة الأوزان واعتماد عمليات الجمع
        </p>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-2">
        {Object.entries(STATUS_AR).map(([value, label]) => (
          <button
            key={value}
            aria-pressed={status === value}
            onClick={() => setStatus(value)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              status === value
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:bg-white/70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {notice && (
        <Alert kind="success">{notice}</Alert>
      )}

      {error && <Alert>{error}</Alert>}

      {/* Loading */}
      {!list && !error && <Loading />}

      {/* Empty */}
      {list && list.length === 0 && (
        <Empty>لا توجد شحنات بهذه الحالة.</Empty>
      )}

      {/* Pickups */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {list?.map((p) => (
          <Card
            key={p.id}
            className="h-full border border-slate-200 shadow-sm transition hover:shadow-md"
          >
            <div className="space-y-5">

              {/* Company + Status */}
              <div className="flex flex-wrap items-start justify-between gap-3">

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Building2 size={22} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-800">
                      {p.companyName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      رقم الشحنة: {p.id}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {STATUS_AR[p.status] || p.status}
                </span>

              </div>

              {/* Schedule Information */}
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CalendarDays size={17} className="text-emerald-600" />
                  <span>{p.scheduledDate}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock3 size={17} className="text-emerald-600" />
                  <span>{p.timeSlot}</span>
                </div>

                <div className="col-span-2 flex items-center gap-2 text-sm text-slate-600">
                  <Truck size={17} className="text-emerald-600" />
                  <span>المندوب: {p.collectorName || 'غير محدد'}</span>
                </div>

              </div>

              {/* Waste Items */}
              {p.items && (
                <div>
                  <h3 className="mb-3 text-sm font-bold text-slate-700">
                    تفاصيل المخلفات
                  </h3>

                  <div className="space-y-2">
                    {p.items.map((item, index) => (
                      <div
                        key={`${item.trashType}-${index}`}
                        className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                      >
                        <span className="text-sm text-slate-600">
                          {TRASH_AR[item.trashType] || item.trashType}
                        </span>

                        <span className="font-semibold text-slate-800">
                          {item.weightKg} كجم
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                      <Weight size={18} />
                      إجمالي الوزن
                    </div>

                    <span className="font-bold text-emerald-800">
                      {p.totalWeightKg} كجم
                    </span>
                  </div>
                </div>
              )}

              {/* Points */}
              {p.pointsAwarded !== undefined && (
                <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <Award size={18} />
                    النقاط المكتسبة
                  </div>

                  <span className="font-bold text-amber-800">
                    +{p.pointsAwarded} نقطة
                  </span>
                </div>
              )}

              {/* No Show Distance */}
              {p.noShowDistanceMeters !== undefined && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  <MapPin size={18} className="shrink-0 text-emerald-600" />
                  <span>
                    تم التحقق: المندوب على بعد {p.noShowDistanceMeters} متر من الشركة
                  </span>
                </div>
              )}

              {/* Scale Photo */}
              {p.scalePhoto && (
                <div className="border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <ImageIcon size={18} className="text-emerald-600" />
                    صورة الميزان
                  </div>

                  <PrivateImage
                    name={p.scalePhoto}
                    label="عرض صورة الميزان"
                  />
                </div>
              )}

              {/* Approve Button */}
              {p.status === 'PENDING_REVIEW' && (
                <div className="border-t border-slate-100 pt-4">
                  <Button
                    block
                    onClick={() => approve(p.id)}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <PackageCheck size={18} />
                      اعتماد الشحنة
                    </span>
                  </Button>
                </div>
              )}

            </div>
          </Card>
        ))}

      </div>
    </div>
  );
}
