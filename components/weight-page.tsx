"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppContext } from "@/components/app-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type WeightLogValues, weightLogSchema } from "@/lib/schemas";
import type { WeightLog } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const defaults: WeightLogValues = {
  log_date: new Date().toISOString().slice(0, 10),
  weight_kg: 70,
  note: ""
};

export function WeightPage() {
  const { initData } = useAppContext();
  const [history, setHistory] = useState<WeightLog[]>([]);
  const [latest, setLatest] = useState<WeightLog | null>(null);
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register, reset } = useForm<WeightLogValues>({
    resolver: zodResolver(weightLogSchema),
    defaultValues: defaults
  });

  async function load() {
    const response = await fetch("/api/weights", {
      headers: {
        "x-telegram-init-data": initData
      }
    });
    if (!response.ok) {
      return;
    }
    const payload = (await response.json()) as {
      latestWeight: WeightLog | null;
      weights: WeightLog[];
    };
    setLatest(payload.latestWeight);
    setHistory(payload.weights);
  }

  useEffect(() => {
    if (initData) {
      void load();
    }
  }, [initData]);

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      await fetch("/api/weights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-init-data": initData
        },
        body: JSON.stringify(values)
      });
      await load();
      reset(values);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">Вес</p>
        <h1 className="text-2xl font-bold">Лог веса</h1>
      </div>

      <Card>
        <p className="text-sm text-slate-500">Последний вес</p>
        <p className="mt-1 text-3xl font-bold">{latest ? `${latest.weight_kg} кг` : "Нет записи"}</p>
        <p className="mt-1 text-sm text-slate-600">
          {latest ? `Дата: ${formatDate(latest.log_date, "d MMM yyyy")}` : "Добавь первую запись"}
        </p>
      </Card>

      <Card className="space-y-3">
        <label className="space-y-1 text-sm">
          <span>Дата</span>
          <input type="date" {...register("log_date")} className="w-full rounded-2xl border border-line bg-surface px-4 py-3" />
        </label>
        <label className="space-y-1 text-sm">
          <span>Вес, кг</span>
          <input type="number" step="0.1" {...register("weight_kg")} className="w-full rounded-2xl border border-line bg-surface px-4 py-3" />
        </label>
        <label className="space-y-1 text-sm">
          <span>Заметка</span>
          <textarea {...register("note")} rows={2} className="w-full rounded-2xl border border-line bg-surface px-4 py-3" />
        </label>
        <Button onClick={() => void onSubmit()} disabled={loading}>
          {loading ? "Сохраняем..." : "Сохранить вес"}
        </Button>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">История</h2>
          <span className="text-sm text-slate-500">{history.length} записей</span>
        </div>
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="rounded-2xl bg-surface px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{formatDate(item.log_date, "d MMM yyyy")}</div>
                <div className="text-lg font-semibold">{item.weight_kg} кг</div>
              </div>
              {item.note ? <div className="mt-1 text-sm text-slate-600">{item.note}</div> : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
