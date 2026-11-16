'use client';

import { useEffect, useId, useRef, useState } from 'react';

const MAX_BYTES = 5 * 1024 * 1024; // 5 ميجابايت
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type Props = {
  name?: string;
  label: string;
  capture?: 'user' | 'environment';
  uploaded?: boolean;
  onChange?: (file: File | null) => void;
};

export default function PhotoUpload({ name, label, capture, uploaded = false, onChange }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  // نحرّر الذاكرة لما المعاينة تتغير أو الكومبوننت يتشال
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function reset(message = '') {
    if (inputRef.current) inputRef.current.value = '';
    setPreview(null);
    setFileName('');
    setError(message);
    onChange?.(null);
  }

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return reset();
    if (!TYPES.includes(file.type)) return reset('نوع الملف غير مدعوم. اختر JPG أو PNG أو WebP.');
    if (file.size > MAX_BYTES) return reset('حجم الصورة أكبر من 5 ميجابايت. اختر صورة أصغر.');

    setError('');
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    onChange?.(file);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        {uploaded && <span className="text-sm font-medium text-brand">تم الرفع ✓</span>}
      </div>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture={capture}
        onChange={pick}
        aria-describedby={error ? `${id}-error` : undefined}
        className="peer sr-only"
      />

      {preview ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={`معاينة: ${label}`} className="h-44 w-full object-cover" />
          <div className="flex items-center justify-between gap-2 p-3">
            <span className="truncate text-sm text-slate-600" dir="ltr">
              {fileName}
            </span>
            <div className="flex shrink-0 gap-2">
              <label
                htmlFor={id}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
              >
                تغيير
              </label>
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-lg border border-alert px-4 py-2 text-sm font-medium text-alert hover:bg-red-50"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center hover:border-brand hover:bg-emerald-50 peer-focus-visible:ring-2 peer-focus-visible:ring-brand"
        >
          <span aria-hidden="true" className="text-3xl">
            📷
          </span>
          <span className="font-medium">{capture === 'environment' ? 'التقط صورة' : 'اختر صورة'}</span>
          <span className="text-xs text-slate-500">JPG أو PNG أو WebP، حتى 5 ميجابايت</span>
        </label>
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-alert">
          {error}
        </p>
      )}
    </div>
  );
}