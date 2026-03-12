import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env.server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/telegram/bot";

type TelegramUpdate = {
  message?: {
    chat: { id: number };
    from?: { id: number; first_name?: string; username?: string };
    text?: string;
  };
};

export async function POST(request: Request) {
  try {
    const update = (await request.json()) as TelegramUpdate;
    const message = update.message;

    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    if (message.text === "/start") {
      const supabase = createServiceSupabaseClient();
      const telegramUserId = String(message.from?.id ?? message.chat.id);
      const displayName = message.from?.first_name ?? message.from?.username ?? "Telegram User";

      await supabase.from("profiles").upsert(
        {
          telegram_user_id: telegramUserId,
          telegram_chat_id: String(message.chat.id),
          display_name: displayName
        },
        { onConflict: "telegram_user_id" }
      );

      await sendTelegramMessage({
        chatId: String(message.chat.id),
        text: "Добро пожаловать. Здесь можно отправлять ежедневный отчет и получать план на завтра.",
        buttonText: "Открыть Mini App",
        webAppUrl: serverEnv.TELEGRAM_WEBAPP_URL
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 400 }
    );
  }
}
