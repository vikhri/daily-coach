"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Главная" },
  { href: "/report", label: "Отчет" },
  { href: "/weight", label: "Вес" },
  { href: "/history", label: "История" },
  { href: "/profile", label: "Профиль" }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[480px] border-t border-line bg-white/95 px-3 py-2 backdrop-blur">
      <div className="grid grid-cols-5 gap-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-2xl px-2 py-3 text-center text-xs",
                active ? "bg-accentSoft font-semibold text-accent" : "text-slate-500"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
