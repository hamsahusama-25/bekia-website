"use client";

import { useState } from "react";
import Link from "next/link";
import { subscriptionData } from "@/data/subscriptionData";

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState<string | number | null>(
    null,
  );

  return (
    <section
      id="subscription"
      className="scroll-mt-20 bg-[#f5f8fc] px-5 py-20 text-[#071a35] md:px-10"
    >
      {/* Header */}
      <div className="mb-14 text-center">
        <span className="mx-auto mb-4 block h-[3px] w-8 rounded bg-emerald-600" />
        <h2 className="mb-4 text-3xl font-extrabold md:text-4xl">
          تسعير حسب وتيرة الجمع
        </h2>
        <p className="text-sm text-slate-500 md:text-base">
          الأسعار معروضة لكل اشتراك. حدد وتيرة الجمع عند إرسال طلبك.
        </p>
      </div>

      {/* Subscription Plans */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
        {subscriptionData.map((plan) => {
          // الباقة دي هي المختارة لو الـ id بتاعها = اللي في الـ state
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`flex min-h-[400px] flex-col rounded-xl border p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                plan.popular
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white"
              } ${isSelected ? "ring-4 ring-emerald-600/40" : ""}`}
            >
              <h3 className="mb-5 text-xl font-bold">{plan.duration}</h3>

              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <strong className="text-2xl">ج.م</strong>
                <small
                  className={`text-xs ${
                    plan.popular ? "text-emerald-100" : "text-slate-500"
                  }`}
                >
                  لكل اشتراك
                </small>
              </div>

              <ul className="mb-7 flex flex-1 flex-col gap-5">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <span
                      className={`text-base font-bold ${
                        plan.popular ? "text-white" : "text-emerald-500"
                      }`}
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(plan.id)}
                aria-pressed={isSelected}
                className={`w-full rounded-md border py-3 text-sm font-semibold transition ${
                  plan.popular
                    ? "border-white bg-white text-emerald-600 hover:bg-emerald-50"
                    : "border-slate-200 bg-white text-[#071a35] hover:border-emerald-600 hover:text-emerald-600"
                }`}
              >
                {isSelected ? "✓ تم اختيار الباقة" : `اختر ${plan.duration}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* بعد الاختيار: زرار يكمل للتسجيل */}
      {selectedPlan !== null && (
        <div className="mt-10 text-center">
          <Link
            href="/register?role=company"
            className="inline-block rounded-xl bg-emerald-600 px-8 py-3.5 font-semibold text-white hover:bg-emerald-700"
          >
            أكمل التسجيل
          </Link>
        </div>
      )}
    </section>
  );
}
