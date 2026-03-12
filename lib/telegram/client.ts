import { createMockInitData } from "@/lib/telegram/server";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}

export function getTelegramInitData() {
  if (typeof window === "undefined") {
    return "";
  }

  const app = window.Telegram?.WebApp;

  if (app?.initData) {
    app.ready();
    app.expand();
    return app.initData;
  }

  return createMockInitData();
}
