"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppContext } from "@/components/app-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { profileSettingsSchema, type ProfileSettingsValues } from "@/lib/schemas";

export function ProfilePage() {
  const { initData, profile, refreshProfile } = useAppContext();
  const [saving, setSaving] = useState(false);
  const { handleSubmit, register, reset } = useForm<ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      timezone: "Asia/Ho_Chi_Minh",
      reminder_time: "21:00",
      goal_text: ""
    }
  });

  useEffect(() => {
    if (profile) {
      reset({
        timezone: profile.timezone,
        reminder_time: profile.reminder_time,
        goal_text: profile.goal_text ?? ""
      });
    }
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-init-data": initData
        },
        body: JSON.stringify(values)
      });
      await refreshProfile();
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">Профиль</p>
        <h1 className="text-2xl font-bold">Настройки</h1>
      </div>

      <Card className="space-y-3">
        <div className="text-sm text-slate-500">Telegram</div>
        <div className="text-lg font-semibold">{profile?.display_name ?? "Пользователь"}</div>
        <div className="text-sm text-slate-600">ID: {profile?.telegram_user_id ?? "-"}</div>
      </Card>

      <Card className="space-y-3">
        <label className="space-y-1 text-sm">
          <span>Часовой пояс</span>
          <input {...register("timezone")} className="w-full rounded-2xl border border-line bg-surface px-4 py-3" />
        </label>
        <label className="space-y-1 text-sm">
          <span>Время напоминания</span>
          <input type="time" {...register("reminder_time")} className="w-full rounded-2xl border border-line bg-surface px-4 py-3" />
        </label>
        <label className="space-y-1 text-sm">
          <span>Цель</span>
          <textarea {...register("goal_text")} rows={4} className="w-full rounded-2xl border border-line bg-surface px-4 py-3" />
        </label>
        <Button onClick={() => void onSubmit()} disabled={saving}>
          {saving ? "Сохраняем..." : "Сохранить настройки"}
        </Button>
      </Card>
    </div>
  );
}
