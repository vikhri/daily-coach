import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env.server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/telegram/bot";

function todayInTimezone(timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.format(new Date());
}

function minutesInTimezone(timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const [hours, minutes] = formatter.format(new Date()).split(":").map(Number);
  return hours * 60 + minutes;
}

function parseReminderMinutes(reminderTime: string) {
  const [hours, minutes] = reminderTime.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (
      serverEnv.TELEGRAM_INIT_DATA_VALIDATION_SECRET &&
      authHeader !== `Bearer ${serverEnv.TELEGRAM_INIT_DATA_VALIDATION_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceSupabaseClient();
    const { data: profiles, error } = await supabase.from("profiles").select("*");

    if (error || !profiles) {
      return NextResponse.json({ error: error?.message ?? "No profiles" }, { status: 500 });
    }

    const results = [];

    for (const profile of profiles) {
      const localDate = todayInTimezone(profile.timezone);
      const nowMinutes = minutesInTimezone(profile.timezone);
      const reminderMinutes = parseReminderMinutes(profile.reminder_time);

      if (nowMinutes < reminderMinutes || nowMinutes > reminderMinutes + 10) {
        continue;
      }

      const { data: existingReport } = await supabase
        .from("daily_reports")
        .select("id")
        .eq("profile_id", profile.id)
        .eq("report_date", localDate)
        .maybeSingle();

      if (existingReport) {
        continue;
      }

      const { data: existingReminder } = await supabase
        .from("reminder_logs")
        .select("id")
        .eq("profile_id", profile.id)
        .eq("reminder_date", localDate)
        .maybeSingle();

      if (existingReminder) {
        continue;
      }

      await sendTelegramMessage({
        chatId: profile.telegram_chat_id ?? profile.telegram_user_id,
        text: "Пора заполнить отчет за день",
        buttonText: "Открыть отчет",
        webAppUrl: serverEnv.TELEGRAM_WEBAPP_URL
      });

      await supabase.from("reminder_logs").insert({
        profile_id: profile.id,
        reminder_date: localDate,
        status: "sent"
      });

      results.push({ profile_id: profile.id, reminder_date: localDate });
    }

    return NextResponse.json({ ok: true, sent: results.length, results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Reminder job failed" },
      { status: 400 }
    );
  }
}
