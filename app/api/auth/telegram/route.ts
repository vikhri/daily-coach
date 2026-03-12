import { NextResponse } from "next/server";
import { telegramAuthSchema } from "@/lib/schemas";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { mapTelegramUserToProfile, validateTelegramInitData } from "@/lib/telegram/server";

export async function POST(request: Request) {
  try {
    const body = telegramAuthSchema.parse(await request.json());
    const telegram = validateTelegramInitData(body.initData);
    const profileInput = mapTelegramUserToProfile(telegram);
    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profileInput, { onConflict: "telegram_user_id" })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Profile error" }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 400 }
    );
  }
}
