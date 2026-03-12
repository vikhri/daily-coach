import { clientEnv } from "@/lib/env.client";

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

function createMockInitData() {
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

  if (clientEnv.NEXT_PUBLIC_MOCK_TELEGRAM) {
    return createMockInitData();
  }

  return "";
}
