"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-brand">
        <svg viewBox="0 0 40 40" fill="none" className="size-8" aria-hidden="true">
          <path d="M30.5 13.5A12.5 12.5 0 0 0 8 17" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M8 9.5V17h7.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 26.5A12.5 12.5 0 0 0 32 23" stroke="#84CC16" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M32 30.5V23h-7.5" stroke="#84CC16" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 25c-5-5 0-12 8-13-1 8-5 13-8 13Z" fill="#10B981" />
        </svg>
      </div>
      {!compact && (
        <div className="flex flex-col whitespace-nowrap leading-tight">
          <span className="font-heading text-xl font-extrabold text-slate-900">
            Eco <span className="text-brand">Loop</span>
          </span>
          <span className="text-xs font-medium text-slate-400">
            Sustainable Business
          </span>
        </div>
      )}
    </div>
  );
}

function LinkIcon({ link }) {
  const Icon = link.icon;
  if (Icon) return <Icon className="size-6" />;
  return (
    <span className="flex size-6 items-center justify-center rounded-md bg-slate-200 text-sm font-bold">
      {link.label.charAt(0)}
    </span>
  );
}

function NavList({ links, activeHref, collapsed = false, onNavigate }) {
  return (
    <nav aria-label="التنقل">
      <ul className="space-y-1.5 p-3">
        {links.map((l) => {
          const active = l.href === activeHref;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={onNavigate}
                title={collapsed ? l.label : undefined}
                aria-label={collapsed ? l.label : undefined}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center rounded-xl text-base transition-colors ${
                  collapsed ? "justify-center" : "gap-3 px-3.5"
                } ${
                  active
                    ? "bg-emerald-50 font-bold text-brand-dark"
                    : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="shrink-0">
                  <LinkIcon link={l} />
                </span>
                {!collapsed && (
                  <span className="truncate whitespace-nowrap">{l.label}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function Sidebar({
  links,
  activeHref,
  desktopOpen,
  onToggleDesktop,
  mobileOpen,
  onCloseMobile,
}) {
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCloseMobile();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      {/* Desktop */}
      <div
        className={`sticky top-4 z-50 hidden h-[calc(100vh-2rem)] shrink-0 transition-[width] duration-300 md:block ${
          desktopOpen ? "w-72" : "w-[76px]"
        }`}
      >
        <aside className="flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-500 bg-white shadow-sm">
          <div
            className={`flex h-[72px] shrink-0 items-center border-b border-slate-200 ${
              desktopOpen ? "px-4" : "justify-center"
            }`}
          >
            <Brand compact={!desktopOpen} />
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <NavList
              links={links}
              activeHref={activeHref}
              collapsed={!desktopOpen}
            />
          </div>
        </aside>

        {/* سهم الفتح والقفل على حافة السايد بار */}
        <button
          type="button"
          onClick={onToggleDesktop}
          aria-label={desktopOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={desktopOpen}
          className="absolute -end-3.5 top-[72px] flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-emerald-50 hover:text-brand"
        >
          {desktopOpen ? (
            <ChevronRight className="size-4" strokeWidth={2.5} />
          ) : (
            <ChevronLeft className="size-4" strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="القائمة"
            className="absolute inset-y-3 start-3 flex w-72 max-w-[85%] flex-col overflow-hidden rounded-3xl bg-white shadow-xl"
          >
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 px-4">
              <Brand />
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="إغلاق"
                className="flex size-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavList
                links={links}
                activeHref={activeHref}
                onNavigate={onCloseMobile}
              />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}