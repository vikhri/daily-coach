"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/components/app-provider";
import type { AiFeedback, DailyReport, WeightLog } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type DashboardPayload = {
  latestWeight: WeightLog | null;
  latestReport: DailyReport | null;
  latestFeedback: AiFeedback | null;
};

export function Dashboard() {
  const { initData, profile, loading } = useAppContext();
  const [data, setData] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    if (!initData) {
      return;
    }

    fetch("/api/reports?limit=1", {
      headers: {
        "x-telegram-init-data": initData
      }
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        return (await response.json()) as {
          reports: Array<DailyReport & { ai_feedback: AiFeedback | null }>;
          latestWeight: WeightLog | null;
        };
      })
      .then((payload) => {
        if (!payload) {
          return;
        }
        const latest = payload.reports[0] ?? null;
        setData({
          latestWeight: payload.latestWeight,
          latestReport: latest,
          latestFeedback: latest?.ai_feedback ?? null
        });
      })
      .catch(() => setData(null));
  }, [initData]);

  return (
    <div className="space-y-4">
      <section className="space-y-2 pt-2">
        <p className="text-sm text-slate-500">Ежедневный отчет и AI-план</p>
        <h1 className="text-3xl font-bold text-ink">
          {loading ? "Загрузка..." : `Привет, ${profile?.display_name ?? "друг"}`}
        </h1>
        <p className="text-sm text-slate-600">
          Короткий формат отчета на вечер. Все советы сохраняются по датам.
        </p>
      </section>

      <Card className="bg-ink text-white">
        <p className="text-sm text-slate-300">Текущая цель</p>
        <p className="mt-2 text-lg font-semibold">
          {profile?.goal_text ?? "Мягкое снижение веса с ежедневной обратной связью"}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white/10 p-3">
            <div className="text-slate-300">Часовой пояс</div>
            <div className="mt-1 font-semibold">{profile?.timezone ?? "Asia/Ho_Chi_Minh"}</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <div className="text-slate-300">Напоминание</div>
            <div className="mt-1 font-semibold">{profile?.reminder_time ?? "21:00"}</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Последний вес</p>
              <p className="mt-1 text-2xl font-bold">
                {data?.latestWeight ? `${data.latestWeight.weight_kg} кг` : "Нет записи"}
              </p>
            </div>
            <Link href="/weight">
              <Button variant="secondary">Вес</Button>
            </Link>
          </div>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Последний отчет</p>
          <p className="mt-1 text-lg font-semibold">
            {data?.latestReport ? formatDate(data.latestReport.report_date, "d MMMM yyyy") : "Пока пусто"}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {data?.latestFeedback?.tomorrow_plan?.focus ??
              "После отправки отчета здесь появится краткий фокус на завтра."}
          </p>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/report">
          <Button className="w-full">Заполнить отчет</Button>
        </Link>
        <Link href="/history">
          <Button className="w-full" variant="secondary">
            История
          </Button>
        </Link>
      </div>
    </div>
  );
}
