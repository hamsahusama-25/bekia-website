import { Card } from "@/components/ui";
import type { Progress } from "./types";

export default function TargetCard({ progress }: { progress: Progress }) {
  const done = progress.completedCompaniesThisMonth;
  const target = progress.monthlyCompanyTarget;
  const pct = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
  const reached = target > 0 && done >= target;

  return (
    <Card title="تارجت الشهر">
      <div className="flex items-end justify-between">
        <p className="text-3xl font-extrabold">
          {done}
          <span className="text-base font-normal text-slate-500">
            {" "}
            / {target} شركة
          </span>
        </p>
        <span className="text-sm font-bold text-brand">{pct}%</span>
      </div>

      <div
        role="progressbar"
        aria-label="تقدم التارجت الشهري"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-slate-500">
        {reached
          ? "أحسنت! حققت التارجت 🎉"
          : `باقي ${Math.max(0, target - done)} شركة`}
      </p>
    </Card>
  );
}
