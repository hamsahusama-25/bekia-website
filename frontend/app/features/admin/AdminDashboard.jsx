"use client";

import { useState } from "react";
import { useGuard } from "@/lib/useGuard";
import { Loading, Shell } from "@/components/ui";

import Overview from "./sections/Overview";
import Collectors from "./sections/Collectors";
import Pickups from "./sections/Pickups";
import Schedule from "./sections/Schedule";
import Packages from "./sections/Packages";
import { TABS } from "./constants";

export default function AdminDashboard() {
  const { session, logout } = useGuard("admin");
  const [tab, setTab] = useState("overview");

  if (!session) return <Loading />;

  const sections = {
    overview: <Overview />,
    collectors: <Collectors />,
    pickups: <Pickups />,
    schedule: <Schedule />,
    packages: <Packages />,
  };

  return (
    <Shell
    title="لوحة الإدارة"
    user={session.user.fullname}
    onLogout={logout}
    wide
  >
    <div className="flex  flex-col gap-4 md:flex-row">

      {/* Sidebar */}
      <aside className="w-full shrink-0 rounded-xl bg-white p-3 shadow-md md:w-56 lg:w-64 md:self-start">

        <div className="mb-2 hidden p-3 md:block">
          <h5 className="pb-3 text-xl font-semibold text-gray-900">
            الإدارة
          </h5>
          <hr className="border-t-2 border-gray-300" />
        </div>

        <nav
          className="flex flex-row gap-2 overflow-x-auto md:flex-col md:overflow-visible"
          aria-label="قائمة الإدارة"
        >
          {TABS.map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={`flex shrink-0 items-center gap-2 rounded-lg p-3 text-sm transition-all md:w-full md:gap-3
                ${
                  tab === value
                    ? "bg-[#e6f4f0] text-[#049568]"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
            >
              <Icon size={18} />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="mt-1 min-w-0 flex-1 rounded-xl bg-[#f5f8f5]">
        {sections[tab]}
      </main>

    </div>
  </Shell>
  );
}
