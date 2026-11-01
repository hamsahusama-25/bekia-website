'use client';

import { useId } from 'react';

export function Shell({ title, user, onLogout, children, wide = false }) {
  return (
    <div className="min-h-screen">
      <header className="bg-ink text-white">
        <div className={`mx-auto flex items-center justify-between px-4 py-3 ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-6 w-6 rounded-md bg-brand" />
            <span className="font-bold">Loop Eco</span>
            <span className="text-sm text-slate-300">· {title}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {user && <span className="hidden text-slate-300 sm:inline">{user}</span>}
            {onLogout && (
              <button onClick={onLogout} className="rounded-md border border-slate-500 px-3 py-1 hover:bg-slate-700">
                خروج
              </button>
            )}
          </div>
        </div>
      </header>
      <main className={`mx-auto space-y-4 px-4 py-6 ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}>{children}</main>
    </div>
  );
}

export function Card({ title, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {title && <h2 className="mb-3 text-lg font-bold">{title}</h2>}
      {children}
    </section>
  );
}

export function Field({ label, hint, error, children, ...props }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children ? (
        children(id)
      ) : (
        <input
          id={id}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-brand"
          {...props}
        />
      )}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-alert">{error}</p>}
    </div>
  );
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    danger: 'border border-alert text-alert hover:bg-red-50',
    ghost: 'border border-slate-300 hover:bg-slate-100',
  };
  return (
    <button
      className={`rounded-lg px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Alert({ kind = 'error', children }) {
  if (!children) return null;
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-slate-200 bg-slate-50 text-slate-700',
  };
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-3 py-2 text-sm ${styles[kind]}`}>
      {children}
    </div>
  );
}

export function Loading({ label = 'جاري التحميل...' }) {
  return <p className="py-8 text-center text-slate-500">{label}</p>;
}

export function Empty({ children }) {
  return <p className="py-6 text-center text-slate-500">{children}</p>;
}

export const LEVEL_STYLE = {
  Bronze: 'bg-amber-100 text-amber-800',
  Silver: 'bg-slate-200 text-slate-800',
  Gold: 'bg-yellow-200 text-yellow-900',
};

export const FREQUENCY_AR = {
  twice_weekly: 'مرتين في الأسبوع',
  weekly: 'مرة في الأسبوع',
  biweekly: 'مرة كل أسبوعين',
  monthly: 'مرة في الشهر',
};

export const TRASH_AR = { plastic: 'بلاستيك', paper: 'ورق', glass: 'زجاج', metal: 'معادن / كانزات' };

export const STATUS_AR = {
  SCHEDULED: 'مجدولة',
  PENDING_REVIEW: 'في انتظار الاعتماد',
  COMPLETED: 'مكتملة',
  NO_SHOW: 'عدم استجابة',
};
