import type { Metadata } from "next";
import "@/app/globals.css";
import { AppProvider } from "@/components/app-provider";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Daily Coach Mini App",
  description: "Telegram Mini App для ежедневных отчетов по питанию и активности"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
