import { env } from "@/lib/env";

const base = "https://api.telegram.org";

type TelegramKeyboardButton = {
  text: string;
  web_app?: { url: string };
};

export async function sendTelegramMessage(params: {
  chatId: string;
  text: string;
  buttonText?: string;
  webAppUrl?: string;
}) {
  if (!env.TELEGRAM_BOT_TOKEN) {
    return null;
  }

  const keyboard =
    params.buttonText && params.webAppUrl
      ? {
          inline_keyboard: [
            [
              {
                text: params.buttonText,
                web_app: { url: params.webAppUrl }
              } satisfies TelegramKeyboardButton
            ]
          ]
        }
      : undefined;

  const response = await fetch(`${base}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: params.chatId,
      text: params.text,
      reply_markup: keyboard
    })
  });

  if (!response.ok) {
    throw new Error("Telegram sendMessage failed");
  }

  return response.json();
}

export async function setTelegramWebhook() {
  if (!env.TELEGRAM_BOT_TOKEN || !env.APP_BASE_URL) {
    throw new Error("Webhook env is missing");
  }

  const webhookUrl = `${env.APP_BASE_URL}/api/bot/webhook`;

  return fetch(`${base}/bot${env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: webhookUrl
    })
  });
}
