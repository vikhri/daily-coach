import type { PropsWithChildren } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <>
      <main className="page-shell">{children}</main>
      <BottomNav />
    </>
  );
}
