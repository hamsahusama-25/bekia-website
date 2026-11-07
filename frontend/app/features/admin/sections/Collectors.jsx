
"use client";

import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { Alert, Button, Card, Empty, Loading } from "@/components/ui";
import { UserRound, Mail, Phone, MapPin, CalendarDays, FileText } from "lucide-react";
import PrivateImage from "@/components/admin/PrivateImage";

export default function Collectors() {
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    api.get("/admin/collectors")
      .then(setList)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(id) {
    setError("");
    setNotice("");

    try {
      await api.patch(`/admin/collectors/${id}/approve`, {});
      setNotice("تم قبول المندوب كموظف بنجاح");
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (!list) return error ? <Alert>{error}</Alert> : <Loading />;

  return (
    <div className="space-y-6">

      {/* Notifications */}
      {notice && <Alert kind="success">{notice}</Alert>}
      {error && <Alert>{error}</Alert>}

      {/* Collectors Grid */}
      {list.length === 0 ? (
        <Empty>لا يوجد مندوبون مسجلون.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {list.map((c) => (
            <Card key={c.id} className="h-full border border-slate-200 shadow-sm">

              <div className="flex h-full flex-col items-center text-center">

                {/* Profile Image */}
                <div className="mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-emerald-100 bg-slate-100">
                  {c.documents?.faceId ? (
                    <div className="[&_img]:h-28 [&_img]:w-28 [&_img]:rounded-full [&_img]:object-cover">
                      <PrivateImage name={c.documents.faceId} />
                    </div>
                  ) : (
                    <UserRound size={48} className="text-slate-400" />
                  )}
                </div>

                {/* Name */}
                <h2 className="text-lg font-bold text-slate-800">
                  {c.fullname}
                </h2>

                {/* Status */}
                <span
                  className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    c.isApprovedByAdmin
                      ? "bg-emerald-100 text-emerald-700"
                      : c.documentsComplete
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {c.isApprovedByAdmin
                    ? "معتمد"
                    : c.documentsComplete
                      ? "في انتظار الموافقة"
                      : "المستندات غير مكتملة"}
                </span>

                {/* Personal Information */}
                <div className="mt-5 w-full space-y-3 border-t border-slate-100 pt-4 text-right">

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={16} className="shrink-0 text-emerald-600" />
                    <span className="break-all" dir="ltr">{c.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={16} className="shrink-0 text-emerald-600" />
                    <span dir="ltr">{c.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays size={16} className="shrink-0 text-emerald-600" />
                    <span>{c.age} سنة</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={16} className="shrink-0 text-emerald-600" />
                    <span>{c.address}</span>
                  </div>

                </div>

                {/* Documents */}
                <div className="mt-5 w-full border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-center justify-center gap-2 font-semibold text-slate-700">
                    <FileText size={17} className="text-emerald-600" />
                    <span>المستندات</span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    {c.documents?.nationalId && (
                      <PrivateImage
                        name={c.documents.nationalId}
                        label="البطاقة"
                      />
                    )}

                    {c.documents?.criminalRecord && (
                      <PrivateImage
                        name={c.documents.criminalRecord}
                        label="الفيش والتشبيه"
                      />
                    )}
                  </div>
                </div>

                {/* Approve Button */}
                {!c.isApprovedByAdmin && (
                  <div className="mt-auto w-full pt-5">
                    <Button
                      block
                      onClick={() => approve(c.id)}
                      disabled={!c.documentsComplete}
                    >
                      قبول المندوب كموظف
                    </Button>
                  </div>
                )}

              </div>
            </Card>
          ))}

        </div>
      )}
    </div>
  );
}
