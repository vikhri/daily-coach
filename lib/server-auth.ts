import { headers } from "next/headers";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { mapTelegramUserToProfile, validateTelegramInitData } from "@/lib/telegram/server";

export async function getAuthenticatedProfile() {
  const headerStore = await headers();
  const initData = headerStore.get("x-telegram-init-data");

  if (!initData) {
    throw new Error("x-telegram-init-data header is required");
  }

  const telegram = validateTelegramInitData(initData);
  const mapped = mapTelegramUserToProfile(telegram);
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .upsert(mapped, { onConflict: "telegram_user_id" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to load profile");
  }

  return data;
}
