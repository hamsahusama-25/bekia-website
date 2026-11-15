import { Button, Card, Empty } from "@/components/ui";
import StopCard from "./StopCard";
import type { RouteData, Stop } from "./types";

type Props = {
  route: RouteData | null;
  loading: boolean;
  onRefresh: () => void;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  onNoShow: (stop: Stop) => void;
  onDone: (msg: string) => void;
};

export default function RouteList({
  route,
  loading,
  onRefresh,
  openId,
  setOpenId,
  onNoShow,
  onDone,
}: Props) {
  return (
    <Card title="مسار اليوم (الأقرب أولًا)">
      <Button
        type="button"
        variant="ghost"
        className="mb-4 min-h-12 w-full"
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? "جاري التحديث..." : "🔄 تحديث المسار من موقعي"}
      </Button>

      {/* هيكل مؤقت أثناء أول تحميل */}
      {!route && loading && (
        <div className="space-y-3" aria-busy="true">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      )}

      {route && route.stops.length === 0 && (
        <Empty>لا توجد شركات مجدولة لك اليوم.</Empty>
      )}

      <ol className="space-y-3">
        {route?.stops.map((stop, i) => (
          <StopCard
            key={stop.pickupId}
            stop={stop}
            index={i}
            isOpen={openId === stop.pickupId}
            onToggle={() =>
              setOpenId(openId === stop.pickupId ? null : stop.pickupId)
            }
            onClose={() => setOpenId(null)}
            onNoShow={onNoShow}
            onDone={onDone}
          />
        ))}
      </ol>
    </Card>
  );
}
