import { Button } from "@/components/ui";
import PickupPanel from "./PickupPanel";
import type { Stop } from "./types";

type Props = {
  stop: Stop;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onNoShow: (stop: Stop) => void;
  onDone: (msg: string) => void;
};

export default function StopCard({
  stop,
  index,
  isOpen,
  onToggle,
  onClose,
  onNoShow,
  onDone,
}: Props) {
  const distance =
    stop.distanceMeters >= 1000
      ? `${(stop.distanceMeters / 1000).toFixed(1)} كم`
      : `${stop.distanceMeters} م`;

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand font-bold text-white"
        >
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold">{stop.companyName}</h3>
          <p className="text-sm text-slate-600">{stop.address}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              🕒 {stop.timeSlot}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-brand">
              📍 {distance}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          type="button"
          className="min-h-12 text-base"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          {isOpen ? "إخفاء" : "استلام"}
        </Button>
        <Button
          type="button"
          variant="danger"
          className="min-h-12"
          onClick={() => onNoShow(stop)}
        >
          مغلقة / لا استجابة
        </Button>
      </div>

      {isOpen && <PickupPanel stop={stop} onClose={onClose} onDone={onDone} />}
    </li>
  );
}
