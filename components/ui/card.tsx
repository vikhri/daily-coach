import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={cn(
        "rounded-xl2 border border-line bg-card p-4 shadow-card",
        className
      )}
    >
      {children}
    </section>
  );
}
