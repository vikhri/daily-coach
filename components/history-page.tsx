"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/components/app-provider";
import { Card } from "@/components/ui/card";
import { TAG_LABELS } from "@/lib/constants";
import type { AiFeedback, DailyReport, WeightLog } from "@/lib/types";
import { formatDate, summarizeMeal } from "@/lib/utils";

type HistoryItem = DailyReport & {
  ai_feedback: AiFeedback | null;
};

function readableTags(tags: string[]) {
  return tags.map((tag) => TAG_LABELS[tag] ?? tag).join(", ");
}

export function HistoryPage() {
  const { initData } = useAppContext();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [latestWeight, setLatestWeight] = useState<WeightLog | null>(null);

  useEffect(() => {
    if (!initData) {
      return;
    }

    fetch("/api/reports", {
      headers: {
        "x-telegram-init-data": initData
      }
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        return (await response.json()) as { reports: HistoryItem[]; latestWeight: WeightLog | null };
      })
      .then((payload) => {
        if (!payload) {
          return;
        }
        setItems(payload.reports);
        setLatestWeight(payload.latestWeight);
      })
      .catch(() => {
        setItems([]);
        setLatestWeight(null);
      });
  }, [initData]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">История</p>
        <h1 className="text-2xl font-bold">Предыдущие отчеты</h1>
      </div>

      <Card>
        <p className="text-sm text-slate-500">Вес в контексте</p>
        <p className="mt-1 text-xl font-semibold">
          {latestWeight ? `${latestWeight.weight_kg} кг` : "Нет свежего веса"}
        </p>
      </Card>

      <div className="space-y-4">
        {items.map((report) => (
          <Card key={report.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{formatDate(report.report_date, "d MMMM yyyy")}</p>
                <p className="text-sm text-slate-500">{report.water_glasses} стаканов воды</p>
              </div>
              <div className="rounded-full bg-accentSoft px-3 py-1 text-sm text-accent">
                Энергия: {report.energy_level ?? "-"}
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <div>
                <span className="font-medium">Еда:</span>{" "}
                {[
                  summarizeMeal(report.breakfast_tags, report.breakfast_note),
                  summarizeMeal(report.lunch_tags, report.lunch_note),
                  summarizeMeal(report.dinner_tags, report.dinner_note)
                ].join(" / ")}
              </div>
              <div>
                <span className="font-medium">Активность:</span>{" "}
                {[readableTags(report.activity_tags), `${report.walking_minutes} мин ходьбы`]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              {report.ai_feedback ? (
                <div>
                  <span className="font-medium">AI:</span>{" "}
                  {report.ai_feedback.change_tomorrow[0] ?? report.ai_feedback.tomorrow_plan.focus}
                </div>
              ) : (
                <div>
                  <span className="font-medium">AI:</span> Нет анализа
                </div>
              )}
            </div>
            <details className="rounded-2xl bg-surface p-3 text-sm">
              <summary className="cursor-pointer font-medium">Полный отчет</summary>
              <div className="mt-3 space-y-2 text-slate-700">
                <div><span className="font-medium">Завтрак:</span> {summarizeMeal(report.breakfast_tags, report.breakfast_note)}</div>
                <div><span className="font-medium">Обед:</span> {summarizeMeal(report.lunch_tags, report.lunch_note)}</div>
                <div><span className="font-medium">Ужин:</span> {summarizeMeal(report.dinner_tags, report.dinner_note)}</div>
                <div><span className="font-medium">Перекусы:</span> {summarizeMeal(report.snacks_tags, report.snacks_note)}</div>
                <div><span className="font-medium">Активность:</span> {readableTags(report.activity_tags) || "Нет"}</div>
                <div><span className="font-medium">Бег:</span> {report.running_minutes} мин</div>
                <div><span className="font-medium">Дом. тренировка:</span> {report.home_workout_minutes} мин</div>
                <div><span className="font-medium">Голод вечером:</span> {report.evening_hunger ?? "-"}</div>
                <div><span className="font-medium">Сложности:</span> {report.difficulties_note || "Нет"}</div>
              </div>
            </details>
            {report.ai_feedback ? (
              <details className="rounded-2xl bg-surface p-3 text-sm">
                <summary className="cursor-pointer font-medium">Полный AI-ответ</summary>
                <div className="mt-3 space-y-2">
                  <div>
                    <div className="font-medium">Что хорошо</div>
                    <div>{report.ai_feedback.what_good.join(", ")}</div>
                  </div>
                  <div>
                    <div className="font-medium">Улучшить</div>
                    <div>{report.ai_feedback.what_to_improve.join(", ")}</div>
                  </div>
                  <div>
                    <div className="font-medium">Изменить завтра</div>
                    <div>{report.ai_feedback.change_tomorrow.join(", ")}</div>
                  </div>
                  <div>
                    <div className="font-medium">Фокус</div>
                    <div>{report.ai_feedback.tomorrow_plan.focus}</div>
                  </div>
                </div>
              </details>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
