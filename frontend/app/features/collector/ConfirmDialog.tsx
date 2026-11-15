'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui';

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      className="m-auto w-[min(92vw,420px)] rounded-2xl p-6 shadow-xl backdrop:bg-black/50"
    >
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-slate-600">{message}</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button type="button" variant="danger" className="min-h-12" onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button type="button" variant="ghost" className="min-h-12" onClick={onCancel}>
          تراجع
        </Button>
      </div>
    </dialog>
  );
}