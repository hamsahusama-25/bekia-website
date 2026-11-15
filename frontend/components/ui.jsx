"use client";

import { useId } from "react";

export function Shell({ title, user, onLogout, children, wide = false }) {
  const userInitial =
    typeof user === "string" && user.trim()
      ? user.trim().charAt(0).toUpperCase()
      : "U";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex min-h-[72px] w-[95%] items-center justify-between gap-4 sm:w-[90%]">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-brand">
              <svg
                viewBox="0 0 40 40"
                fill="none"
                className="size-7"
                aria-hidden="true"
              >
                <path
                  d="M30.5 13.5A12.5 12.5 0 0 0 8 17"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M8 9.5V17h7.5"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 26.5A12.5 12.5 0 0 0 32 23"
                  stroke="#84CC16"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M32 30.5V23h-7.5"
                  stroke="#84CC16"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M20 25c-5-5 0-12 8-13-1 8-5 13-8 13Z" fill="#10B981" />
              </svg>
            </div>

            <div className="flex shrink-0 flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Eco <span className="text-brand">Loop</span>
              </span>
              <span className="hidden text-[9px] font-semibold uppercase tracking-widest text-slate-400 sm:block">
                Sustainable Business
              </span>
            </div>

            {title && (
              <>
                <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />
                <span className="truncate text-sm font-semibold text-slate-600">
                  {title}
                </span>
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            {user && (
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                  {userInitial}
                </div>

                <span className="hidden max-w-36 truncate text-sm font-semibold text-slate-700 sm:block">
                  {user}
                </span>
              </div>
            )}

            {user && onLogout && <div className="h-8 w-px bg-slate-200" />}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path
                    d="M10 17l5-5-5-5M15 12H3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="hidden sm:inline">خروج</span>
              </button>
            )}
          </div>
        </div>
      </header>
      {/* Page Content */}
      <main className="mx-auto w-[95%] space-y-4 py-6 sm:w-[90%]">
        {children}
      </main>
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
