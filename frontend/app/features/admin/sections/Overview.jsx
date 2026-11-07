"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { Alert, Card, Empty, Loading, TRASH_AR } from "@/components/ui";

import { BuildingComplex, WeightTilde, Van, Users, Ban } from "lucide-react";
import WeeklyChart from "@/components/admin/weeklyCharts/weeklyCharts";
import DoughnutChart from "@/components/admin/Doughnut Chart/DoughnutChart";

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then(setStats)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!stats) return <Loading />;

  const kpis = [
    [
      "الشركات التي تمت خدمتها",
      stats.companiesServed,
      BuildingComplex,
      "text-[#169d73]",
      "bg-[#e0f6e9]",
    ],
    [
      "إجمالي الوزن (كجم)",
      stats.totalWeightKg,
      WeightTilde,
      "text-emerald-600",
      "bg-emerald-100",
    ],
    [
      "طلبات جارية",
      stats.activeOrders,
      Van,
      "text-orange-600",
      "bg-orange-100",
    ],
    [
      "مندوبون في انتظار الموافقة",
      stats.pendingCollectors,
      Users,
      "text-purple-600",
      "bg-purple-100",
    ],
    ["حالات عدم استجابة", stats.noShows, Ban, "text-red-600", "bg-red-100"],
  ];

  return (
    <div className="space-y-4 ">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ">
        {kpis.map(([label, value, Icon, iconColor, bgColor]) => (
          <Card key={label} className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-brand">{value}</p>
              <p className="text-xs text-slate-600">{label}</p>
            </div>
            <div
              className={`flex p-3 items-center justify-center rounded-xl ${bgColor}`}
            >
              <Icon size={24} className={`${iconColor}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">
        <div className="w-full min-w-0 max-w-full overflow-hidden">
          <WeeklyChart />
        </div>

        <div className="w-full min-w-0 max-w-full overflow-hidden">
          <DoughnutChart />
        </div>
      </div>

      <Card title={`الوزن حسب النوع (${stats.month})`}>
        {Object.keys(stats.weightByType).length === 0 ? (
          <Empty>لا توجد شحنات معتمدة هذا الشهر.</Empty>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-4">
            {Object.entries(stats.weightByType).map(([type, kg]) => (
              <li key={type} className="rounded-lg bg-slate-50 p-3">
                <span className="font-bold">{kg}</span> كجم · {TRASH_AR[type]}
              </li>
            ))}
          </ul>
        )}
      </Card>
      
    </div>
  );
}
