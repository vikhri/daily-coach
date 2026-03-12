"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Profile } from "@/lib/types";
import { getTelegramInitData } from "@/lib/telegram/client";

type AppContextValue = {
  initData: string;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

async function requestProfile(initData: string) {
  const response = await fetch("/api/auth/telegram", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ initData })
  });

  if (!response.ok) {
    throw new Error("Failed to load profile");
  }

  const payload = (await response.json()) as { profile: Profile };
  return payload.profile;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [initData, setInitData] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    const nextInitData = getTelegramInitData();
    setInitData(nextInitData);
    const nextProfile = await requestProfile(nextInitData);
    setProfile(nextProfile);
  }

  useEffect(() => {
    refreshProfile()
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      initData,
      profile,
      loading,
      refreshProfile
    }),
    [initData, loading, profile]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
}
