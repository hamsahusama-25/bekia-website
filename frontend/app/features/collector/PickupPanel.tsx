"use client";

import { useCallback, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import QrScanner, { qrScanSupported } from "@/components/QrScanner";
import { Alert, Button, Field, TRASH_AR } from "@/components/ui";
import PhotoUpload from "./PhotoUpload";
import type { Stop } from "./types";

type Item = { trashType: string; weightKg: string };

type Props = {
  stop: Stop;
  onClose: () => void;
  onDone: (msg: string) => void;
};

export default function PickupPanel({ stop, onClose, onDone }: Props) {
  const [qrToken, setQrToken] = useState("");
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState<Item[]>([
    { trashType: "plastic", weightKg: "" },
  ]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onScan = useCallback((value: string) => {
    setQrToken(value);
    setScanning(false);
  }, []);

  const update = (i: number, patch: Partial<Item>) =>
    setItems((list) =>
      list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    );
  const usedTypes = items.map((i) => i.trashType);
  const nextType = Object.keys(TRASH_AR).find((t) => !usedTypes.includes(t));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!photo) {
      setError("صورة الميزان مطلوبة");
      return;
    }
    setBusy(true);
    setError("");
    const form = new FormData();
    form.append("qrToken", qrToken.trim());
    form.append(
      "items",
      JSON.stringify(
        items.map((i) => ({
          trashType: i.trashType,
          weightKg: Number(i.weightKg),
        })),
      ),
    );
    form.append("scalePhoto", photo);
    try {
      await api.postForm(`/pickups/${stop.pickupId}/complete`, form);
      onDone("تم تسجيل الاستلام وهو الآن في انتظار اعتماد الإدارة");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
    >
      <Field
        label="كود QR الخاص بالشركة"
        hint="امسح الكود من شاشة الشركة أو اكتبه يدويًا"
      >
        {(id) => (
          <div className="flex gap-2">
            <input
              id={id}
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              required
              dir="ltr"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {qrScanSupported() && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setScanning(true)}
              >
                مسح
              </Button>
            )}
          </div>
        )}
      </Field>
      {scanning && (
        <QrScanner onResult={onScan} onClose={() => setScanning(false)} />
      )}

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
                <option
                  key={value}
                  value={value}
                  disabled={usedTypes.includes(value) && value !== it.trashType}
                >
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
              <Button
                type="button"
                variant="ghost"
                aria-label="حذف السطر"
                onClick={() => setItems((l) => l.filter((_, idx) => idx !== i))}
              >
                ✕
              </Button>
            )}
          </div>
        ))}
        {nextType && (
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setItems((l) => [...l, { trashType: nextType, weightKg: "" }])
            }
          >
            + إضافة نوع آخر
          </Button>
        )}
      </fieldset>

      <PhotoUpload
        label="صورة الميزان (إجباري)"
        capture="environment"
        onChange={setPhoto}
      />

      <Alert>{error}</Alert>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? "جاري الإرسال..." : "تأكيد الاستلام"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
