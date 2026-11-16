"use client";

import { useId } from "react";
import { LogOut } from "lucide-react";

function PickeaLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-brand">
        <svg viewBox="0 0 40 40" fill="none" className="size-8" aria-hidden="true">
          <path d="M30.5 13.5A12.5 12.5 0 0 0 8 17" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M8 9.5V17h7.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 26.5A12.5 12.5 0 0 0 32 23" stroke="#84CC16" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M32 30.5V23h-7.5" stroke="#84CC16" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 25c-5-5 0-12 8-13-1 8-5 13-8 13Z" fill="#10B981" />
        </svg>
      </div>
      <span className="font-heading text-xl font-extrabold text-slate-900">
        Pickea
      </span>
    </div>
  );
}

export function Shell({ title, user, onLogout, children, wide = false }) {
  const userInitial =
    typeof user === "string" && user.trim()
      ? user.trim().charAt(0).toUpperCase()
      : "U";

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4">
      <div
        className={`mx-auto flex min-h-[calc(100vh-1.5rem)] flex-col gap-4 sm:min-h-[calc(100vh-2rem)] ${
          wide ? "max-w-[1600px]" : "max-w-3xl"
        }`}
      >
        <header className="sticky top-3 z-40 h-[72px] shrink-0 rounded-3xl border border-emerald-500 bg-white/90 shadow-sm backdrop-blur-md sm:top-4">
          <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <PickeaLogo />
              {title && (
                <>
                  <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />
                  <h1 className="hidden truncate font-heading text-lg font-bold text-slate-800 sm:block">
                    {title}
                  </h1>
                </>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <span className="hidden max-w-44 truncate text-base font-semibold text-slate-700 sm:block">
                    {user}
                  </span>
                  <div
                    role="img"
                    aria-label={typeof user === "string" ? user : "المستخدم"}
                    title={typeof user === "string" ? user : undefined}
                    className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-800"
                  >
                    {userInitial}
                  </div>
                </div>
              )}

              {user && onLogout && <div className="h-8 w-px bg-slate-200" />}

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="تسجيل الخروج"
                  className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-base font-semibold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="size-5 -scale-x-100" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="w-full flex-1 space-y-4">{children}</main>
      </div>
    </div>
  );
}

export function Card({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-8 shadow-sm ${className}`}
    >
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

export function Button({ variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    danger: "border border-alert text-alert hover:bg-red-50",
    ghost: "border border-slate-300 hover:bg-slate-100",
  };
  return (
    <button
      className={`rounded-lg px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Alert({ kind = "error", children }) {
  if (!children) return null;
  const styles = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-slate-200 bg-slate-50 text-slate-700",
  };
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3 py-2 text-sm ${styles[kind]}`}
    >
      {children}
    </div>
  );
}

export function Loading({ label = "جاري التحميل..." }) {
  return <p className="py-8 text-center text-slate-500">{label}</p>;
}

export function Empty({ children }) {
  return <p className="py-6 text-center text-slate-500">{children}</p>;
}

export const LEVEL_STYLE = {
  Bronze: "bg-amber-100 text-amber-800",
  Silver: "bg-slate-200 text-slate-800",
  Gold: "bg-yellow-200 text-yellow-900",
};

export const FREQUENCY_AR = {
  twice_weekly: "مرتين في الأسبوع",
  weekly: "مرة في الأسبوع",
  biweekly: "مرة كل أسبوعين",
  monthly: "مرة في الشهر",
};

export const TRASH_AR = {
  plastic: "بلاستيك",
  paper: "ورق",
  glass: "زجاج",
  metal: "معادن / كانزات",
};

export const STATUS_AR = {
  SCHEDULED: "مجدولة",
  PENDING_REVIEW: "في انتظار الاعتماد",
  COMPLETED: "مكتملة",
  NO_SHOW: "عدم استجابة",
};
