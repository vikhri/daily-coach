"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { subDays } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TagPicker } from "@/components/forms/tag-picker";
import { useAppContext } from "@/components/app-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ACTIVITY_TAGS, MEAL_TAGS } from "@/lib/constants";
import { reportFormSchema, type ReportFormValues } from "@/lib/schemas";
import type { AiFeedback, WeightLog } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const defaults: ReportFormValues = {
  report_date: isoDate(new Date()),
  water_glasses: 0,
  breakfast_tags: [],
  breakfast_note: "",
  lunch_tags: [],
  lunch_note: "",
  dinner_tags: [],
  dinner_note: "",
  snacks_tags: [],
  snacks_note: "",
  activity_tags: [],
  walking_minutes: 0,
  steps: null,
  running_minutes: 0,
  home_workout_minutes: 0,
  energy_level: 3,
  evening_hunger: 5,
  bloating_or_heaviness: false,
  heat_or_dehydration_feeling: false,
  difficulties_note: ""
};

type AnalyzeResponse = {
  reportId: string;
  analysis: AiFeedback;
  latestWeight: WeightLog | null;
};

function MealSection({
  title,
  tagsName,
  noteName,
  control,
  register
}: {
  title: string;
  tagsName: "breakfast_tags" | "lunch_tags" | "dinner_tags" | "snacks_tags";
  noteName: "breakfast_note" | "lunch_note" | "dinner_note" | "snacks_note";
  control: ReturnType<typeof useForm<ReportFormValues>>["control"];
  register: ReturnType<typeof useForm<ReportFormValues>>["register"];
}) {
  return (
    <Card className="space-y-3">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-slate-500">Теги и короткая заметка</p>
      </div>
      <Controller
        control={control}
        name={tagsName}
        render={({ field }) => (
          <TagPicker options={MEAL_TAGS} value={field.value} onChange={field.onChange} />
        )}
      />
      <textarea
        {...register(noteName)}
        rows={3}
        placeholder="Например: суп и рис, позже был десерт"
        className="w-full rounded-2xl border border-line bg-surface px-4 py-3 outline-none"
      />
    </Card>
  );
}

export function ReportPage() {
  const { initData } = useAppContext();
  const [dateMode, setDateMode] = useState<"today" | "yesterday" | "custom">("today");
  const [loading, setLoading] = useState(false);
  const [latestWeight, setLatestWeight] = useState<WeightLog | null>(null);
  const [analysis, setAnalysis] = useState<AiFeedback | null>(null);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: defaults
  });

  const reportDate = watch("report_date");
  const water = watch("water_glasses");

  useEffect(() => {
    if (!initData) {
      return;
    }

    fetch("/api/weights?limit=1", {
      headers: {
        "x-telegram-init-data": initData
      }
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        return (await response.json()) as { latestWeight: WeightLog | null };
      })
      .then((payload) => setLatestWeight(payload?.latestWeight ?? null))
      .catch(() => setLatestWeight(null));
  }, [initData]);

  useEffect(() => {
    if (dateMode === "today") {
      setValue("report_date", isoDate(new Date()));
    }
    if (dateMode === "yesterday") {
      setValue("report_date", isoDate(subDays(new Date(), 1)));
    }
  }, [dateMode, setValue]);

  const reportDateTitle = useMemo(() => formatDate(reportDate, "d MMMM yyyy"), [reportDate]);

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-init-data": initData
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error("submit failed");
      }

      const payload = (await response.json()) as AnalyzeResponse;
      setAnalysis(payload.analysis);
      setLatestWeight(payload.latestWeight);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="space-y-4 pb-20">
      <div className="space-y-1">
        <p className="text-sm text-slate-500">Отчет за день</p>
        <h1 className="text-2xl font-bold">Отчет за {reportDateTitle}</h1>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Последний вес</p>
            <p className="mt-1 text-xl font-semibold">
              {latestWeight ? `${latestWeight.weight_kg} кг` : "Не указан"}
            </p>
          </div>
          <div className="rounded-2xl bg-accentSoft px-3 py-2 text-sm text-accent">
            {latestWeight ? `от ${formatDate(latestWeight.log_date)}` : "Добавь на вкладке Вес"}
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <div>
          <h2 className="font-semibold">Дата отчета</h2>
          <p className="text-sm text-slate-500">Сегодня, вчера или прошедшая дата</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "today", label: "Сегодня" },
            { key: "yesterday", label: "Вчера" },
            { key: "custom", label: "Своя" }
          ].map((item) => (
            <Button
              key={item.key}
              type="button"
              variant={dateMode === item.key ? "primary" : "secondary"}
              onClick={() => setDateMode(item.key as typeof dateMode)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <input
          type="date"
          {...register("report_date")}
          disabled={dateMode !== "custom"}
          className="min-h-12 rounded-2xl border border-line bg-surface px-4 disabled:opacity-70"
        />
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Вода</h2>
            <p className="text-sm text-slate-500">Стаканы за день</p>
          </div>
          <div className="text-3xl font-bold">{water}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" onClick={() => setValue("water_glasses", Math.max(0, water - 1))}>
            -1
          </Button>
          <Button type="button" onClick={() => setValue("water_glasses", water + 1)}>
            +1
          </Button>
        </div>
      </Card>

      <MealSection title="Завтрак" tagsName="breakfast_tags" noteName="breakfast_note" control={control} register={register} />
      <MealSection title="Обед" tagsName="lunch_tags" noteName="lunch_note" control={control} register={register} />
      <MealSection title="Ужин" tagsName="dinner_tags" noteName="dinner_note" control={control} register={register} />
      <MealSection title="Перекусы и напитки" tagsName="snacks_tags" noteName="snacks_note" control={control} register={register} />

      <Card className="space-y-4">
        <div>
          <h2 className="font-semibold">Активность</h2>
          <p className="text-sm text-slate-500">Минуты и теги активности</p>
        </div>
        <Controller
          control={control}
          name="activity_tags"
          render={({ field }) => (
            <TagPicker options={ACTIVITY_TAGS} value={field.value} onChange={field.onChange} />
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm">
            <span>Ходьба, мин</span>
            <input type="number" {...register("walking_minutes")} className="w-full rounded-2xl border border-line bg-surface px-4 py-3" />
          </label>
          <label className="space-y-1 text-sm">
            <span>Шаги</span>
            <input type="number" {...register("steps")} className="w-full rounded-2xl border border-line bg-surface px-4 py-3" />
          </label>
          <label className="space-y-1 text-sm">
            <span>Бег, мин</span>
            <input type="number" {...register("running_minutes")} className="w-full rounded-2xl border border-line bg-surface px-4 py-3" />
          </label>
          <label className="space-y-1 text-sm">
            <span>Дом. тренировка, мин</span>
            <input type="number" {...register("home_workout_minutes")} className="w-full rounded-2xl border border-line bg-surface px-4 py-3" />
          </label>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="font-semibold">Самочувствие</h2>
          <p className="text-sm text-slate-500">Короткая оценка дня</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm">
            <span>Энергия 1-5</span>
            <input type="number" min={1} max={5} {...register("energy_level")} className="w-full rounded-2xl border border-line bg-surface px-4 py-3" />
          </label>
          <label className="space-y-1 text-sm">
            <span>Голод вечером 1-10</span>
            <input type="number" min={1} max={10} {...register("evening_hunger")} className="w-full rounded-2xl border border-line bg-surface px-4 py-3" />
          </label>
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
          <input type="checkbox" {...register("bloating_or_heaviness")} />
          Вздутие или тяжесть
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
          <input type="checkbox" {...register("heat_or_dehydration_feeling")} />
          Чувство жары или обезвоживания
        </label>
        <textarea
          {...register("difficulties_note")}
          rows={3}
          placeholder="Что было сложно сегодня"
          className="w-full rounded-2xl border border-line bg-surface px-4 py-3"
        />
      </Card>

      {errors.report_date ? (
        <p className="text-sm text-danger">{errors.report_date.message}</p>
      ) : null}

      {analysis ? (
        <div className="space-y-3">
          <Card>
            <h3 className="font-semibold">Что было хорошо</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {analysis.what_good.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="font-semibold">Что улучшить</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {analysis.what_to_improve.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="font-semibold">Что изменить завтра</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {analysis.change_tomorrow.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="font-semibold">План на завтра</h3>
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <div className="font-medium">Еда</div>
                <div>{analysis.tomorrow_plan.food.join(", ")}</div>
              </div>
              <div>
                <div className="font-medium">Вода</div>
                <div>{analysis.tomorrow_plan.water.join(", ")}</div>
              </div>
              <div>
                <div className="font-medium">Движение</div>
                <div>{analysis.tomorrow_plan.movement.join(", ")}</div>
              </div>
              <div>
                <div className="font-medium">Фокус</div>
                <div>{analysis.tomorrow_plan.focus}</div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-20 mx-auto max-w-[480px] px-4">
        <Button className="w-full" onClick={() => void onSubmit()} disabled={loading}>
          {loading ? "Сохраняем..." : "Submit report"}
        </Button>
      </div>
    </div>
  );
}
