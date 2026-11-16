"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import Sidebar, { Brand } from "./Sidebar";

function MenuButton({ onClick, expanded, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="فتح القائمة"
      aria-expanded={expanded}
      className={`size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 ${className}`}
    >
      <Menu className="size-6" />
    </button>
  );
}

export default function AppShell({
  title,
  user,
  onLogout,
  links = [],
  children,
}) {
  const pathname = usePathname();
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const hasNav = links.length > 0;
  const userInitial = (user || "").trim().charAt(0).toUpperCase();
  const activeHref = links
    .filter((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="flex min-h-screen gap-4 bg-slate-50 p-3 sm:p-4">
      {hasNav && (
        <Sidebar
          links={links}
          activeHref={activeHref}
          desktopOpen={desktopOpen}
          onToggleDesktop={() => setDesktopOpen((o) => !o)}
          mobileOpen={mobileOpen}
          onCloseMobile={closeMobile}
        />
      )}

      {/* Content column: navbar + page */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <header className="sticky top-3 z-40 h-[72px] shrink-0 rounded-3xl border border-emerald-500 bg-white/90 shadow-sm backdrop-blur-md sm:top-4">
          <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              {hasNav && (
                <MenuButton
                  className="flex md:hidden"
                  expanded={mobileOpen}
                  onClick={() => setMobileOpen((o) => !o)}
                />
              )}

              {/* اللوجو في السايد بار على الديسكتوب، فبيظهر هنا بس على الموبايل */}
              <div className={hasNav ? "md:hidden" : ""}>
                <Brand />
              </div>

              {title && (
                <>
                  <div
                    className={`mx-1 hidden h-8 w-px bg-slate-200 sm:block ${
                      hasNav ? "md:hidden" : ""
                    }`}
                  />
                  <h1 className="truncate font-heading text-lg font-bold text-slate-800">
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
                    aria-label={user}
                    title={user}
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

        <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-4">
          {children}
        </main>
      </div>
    </div>
  );
}