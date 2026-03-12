import crypto from "crypto";
import { DEFAULT_REMINDER_TIME, DEFAULT_TIMEZONE } from "@/lib/constants";
import { env } from "@/lib/env";
import type { TelegramInitPayload } from "@/lib/telegram/types";

function hmacSha256(key: Buffer | string, value: string) {
  return crypto.createHmac("sha256", key).update(value).digest();
}

function parseInitData(initData: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(initData).entries());
}

export function decodeTelegramInitData(initData: string): TelegramInitPayload {
  const raw = parseInitData(initData);
  return {
    auth_date: raw.auth_date,
    chat_instance: raw.chat_instance,
    chat_type: raw.chat_type,
    hash: raw.hash,
    query_id: raw.query_id,
    user: raw.user ? JSON.parse(raw.user) : undefined
  };
}

export function validateTelegramInitData(initData: string) {
  if (!initData) {
    throw new Error("Telegram init data is missing");
  }

  if (env.NEXT_PUBLIC_MOCK_TELEGRAM) {
    return decodeTelegramInitData(initData);
  }

  const values = parseInitData(initData);
  const hash = values.hash;

  if (!hash || !env.TELEGRAM_BOT_TOKEN) {
    throw new Error("Telegram validation is not configured");
  }

  delete values.hash;

  const checkString = Object.entries(values)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secret = crypto
    .createHash("sha256")
    .update(env.TELEGRAM_BOT_TOKEN)
    .digest();

  const calculatedHash = hmacSha256(secret, checkString).toString("hex");

  if (calculatedHash !== hash) {
    throw new Error("Telegram init data validation failed");
  }

  return decodeTelegramInitData(initData);
}

export function createMockInitData() {
  const user = {
    id: 777000123,
    first_name: "Ira",
    username: "local_user"
  };

  const payload = new URLSearchParams({
    auth_date: `${Math.floor(Date.now() / 1000)}`,
    hash: "mock",
    user: JSON.stringify(user)
  });

  return payload.toString();
}

export function mapTelegramUserToProfile(input: TelegramInitPayload) {
  const user = input.user;

  if (!user) {
    throw new Error("Telegram user not found in init data");
  }

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();

  return {
    telegram_user_id: String(user.id),
    telegram_chat_id: String(user.id),
    display_name: displayName || user.username || "Telegram User",
    timezone: DEFAULT_TIMEZONE,
    reminder_time: DEFAULT_REMINDER_TIME
  };
}
