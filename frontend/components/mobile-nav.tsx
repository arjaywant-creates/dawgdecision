"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";

import { LayoutDashboard, GitCompare, Calculator } from "lucide-react";

import clsx from "clsx";

import { siteConfig } from "@/config/site";

const ICON_MAP: Record<string, any> = {
  Dashboard: LayoutDashboard,
  Compare: GitCompare,
  "Financial Plans": Calculator,
};

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-separator/50 pb-safe">
      <ul className="flex items-center justify-around p-2">
        {siteConfig.navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          const Icon = ICON_MAP[item.label] || LayoutDashboard;

          return (
            <li key={item.href} className="flex-1">
              <NextLink
                className={clsx(
                  "flex flex-col items-center gap-1 p-2 text-xs transition-colors",
                  isActive
                    ? "text-accent font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
                href={item.href}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </NextLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
