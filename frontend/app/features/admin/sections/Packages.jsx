"use client";

import { useCallback, useEffect, useState } from "react";

import { api, errorMessage } from "@/lib/api";
import { Alert, Button, Card, Field, Loading } from "@/components/ui";

export default function Packages() {
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(
    () =>
      api
        .get("/packages")
        .then(setList)
        .catch((e) => setError(errorMessage(e))),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);

  async function save(e, id) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError("");
    try {
      await api.put(`/admin/packages/${id}`, {
        priceEGP: Number(data.get("price")),
        discountPercent: Number(data.get("discount")),
      });
      setNotice("تم حفظ التعديلات");
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  if (!list) return error ? <Alert>{error}</Alert> : <Loading />;
  return (
    <div>
      <Alert kind="success">
        {notice && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            <span>✓</span>
            <p>{notice}</p>
          </div>
        )}
      </Alert>
      <Alert>{error}</Alert>
    <div className="grid  gap-9 md:grid-cols-2">
      {list.map((p) => (
        <Card key={p.id}>
          <div className="border-b-2 mb-5">
            <div className="mb-8 ">
              <h2 className="text-xl">{p.name}</h2>
              <p className=" text-[#6a6868] text-sm">{p.durationMonths} شهور</p>
            </div>

            <h1 className="text-xl mb-3 font-bold">{p.priceEGP} ج. م</h1>
          </div>

          <form
            onSubmit={(e) => save(e, p.id)}
            className="flex flex-wrap items-end gap-3"
          >
            <Field
              label="تعديل السعر  (ج.م)"
              name="price"
              type="number"
              min="0"
              defaultValue={p.priceEGP}
              required
            />
            <Field
              label="الخصم %"
              name="discount"
              type="number"
              min="0"
              max="100"
              defaultValue={p.discountPercent}
              required
            />
            <Button type="submit">حفظ</Button>
          </form>
        </Card>
      ))}
    </div>
    </div>
  );
}
