"use client";

import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { getPosition } from "@/lib/geo";
import { useGuard } from "@/lib/useGuard";
import { Alert, Button, Loading, Shell } from "@/components/ui";
import DocumentsForm from "./DocumentsForm";
import TargetCard from "./TargetCard";
import RouteList from "./RouteList";
import ConfirmDialog from "./ConfirmDialog";
import type { Me, Stop, RouteData } from "./types";

export default function CollectorDashboard() {
  const { session, logout } = useGuard("collector");
  const [me, setMe] = useState<Me | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingStop, setPendingStop] = useState<Stop | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loadingRoute, setLoadingRoute] = useState(false);

  const loadMe = useCallback(
    () =>
      api
        .get("/collector/me")
        .then(setMe)
        .catch((e: unknown) => setError(errorMessage(e))),
    [],
  );

  const loadRoute = useCallback(async () => {
    setLoadingRoute(true);
    setError("");
    try {
      const pos = await getPosition();
      setRoute(
        await api.get(`/collector/smartroute?lng=${pos.lng}&lat=${pos.lat}`),
      );
    } catch (err: any) {
      setError(err.message && !err.code ? err.message : errorMessage(err));
    } finally {
      setLoadingRoute(false);
    }
  }, []);

  useEffect(() => {
    if (session) loadMe();
  }, [session, loadMe]);

  useEffect(() => {
    if (me?.isApprovedByAdmin) loadRoute();
  }, [me, loadRoute]);

  // بعد ما المندوب يأكد في النافذة
  async function confirmNoShow() {
    const stop = pendingStop;
    setPendingStop(null);
    if (!stop) return;
    setError("");
    try {
      const pos = await getPosition();
      await api.post(`/pickups/${stop.pickupId}/no-show`, pos);
      setNotice("تم تسجيل عدم الاستجابة وإبلاغ الإدارة");
      loadRoute();
    } catch (err: any) {
      setError(err.message && !err.code ? err.message : errorMessage(err));
    }
  }

  function handlePickupDone(msg: string) {
    setOpenId(null);
    setNotice(msg);
    loadRoute();
  }

  if (!session || !me) return <Loading />;

  return (
    <Shell title="شاشة المندوب" user={session.user.fullname} onLogout={logout}>
      <Alert kind="success">{notice}</Alert>
      <Alert>{error}</Alert>
      {error && me.isApprovedByAdmin && (
        <Button
          type="button"
          variant="ghost"
          className="mb-3 min-h-12 w-full"
          onClick={loadRoute}
          disabled={loadingRoute}
        >
          إعادة المحاولة
        </Button>
      )}

      {!me.isApprovedByAdmin && (
        <>
          <Alert kind="info">
            حسابك في انتظار موافقة الإدارة.{" "}
            {me.documentsComplete
              ? "تم رفع كل المستندات، وجاري مراجعتها."
              : "ارفع المستندات المطلوبة أولًا."}
          </Alert>
          <DocumentsForm onDone={loadMe} />
        </>
      )}

      {me.isApprovedByAdmin && (
        <>
          {route && <TargetCard progress={route.progress} />}
          <RouteList
            route={route}
            loading={loadingRoute}
            onRefresh={loadRoute}
            openId={openId}
            setOpenId={setOpenId}
            onNoShow={setPendingStop}
            onDone={handlePickupDone}
          />
        </>
      )}

      <ConfirmDialog
        open={pendingStop !== null}
        title="تأكيد عدم الاستجابة"
        message={
          pendingStop
            ? `هل "${pendingStop.companyName}" مغلقة أو لا تستجيب؟ سيتم التحقق من موقعك قبل التسجيل.`
            : ""
        }
        confirmLabel="نعم، سجّل"
        onConfirm={confirmNoShow}
        onCancel={() => setPendingStop(null)}
      />
    </Shell>
  );
}
