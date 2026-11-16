"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { Alert, Button, Card } from "@/components/ui";
import PhotoUpload from "./PhotoUpload";

const ROWS: {
  name: string;
  label: string;
  capture?: "user" | "environment";
}[] = [
  { name: "nationalId", label: "صورة البطاقة الشخصية" },
  { name: "criminalRecord", label: "صورة الفيش والتشبيه" },
  { name: "faceId", label: "صورة الوجه (Face ID)", capture: "user" },
];

type Props = { onDone: () => void };

export default function DocumentsForm({ onDone }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setStatus(
        await api.postForm(
          "/collector/documents",
          new FormData(e.currentTarget),
        ),
      );
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="مستندات التعيين">
      <p className="mb-4 text-sm text-slate-600">
        ارفع المستندات الثلاثة (JPG أو PNG أو WebP حتى 5 ميجابايت). لا يتفعل
        حسابك إلا بعد موافقة الإدارة.
      </p>
      <form onSubmit={submit} className="space-y-5">
        {ROWS.map((row) => (
          <PhotoUpload
            key={row.name}
            name={row.name}
            label={row.label}
            capture={row.capture}
            uploaded={Boolean(status?.[row.name])}
          />
        ))}
        <Alert>{error}</Alert>
        <Button type="submit" className="min-h-12 w-full" disabled={busy}>
          {busy ? "جاري الرفع..." : "رفع المستندات"}
        </Button>
      </form>
    </Card>
  );
}
