"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

export function SideNav({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2">
      <div className="px-2 text-[11px] tracking-[0.12em] text-[#6b5f53] uppercase">
        {title}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-1 lg:overflow-visible lg:pb-0">
        {items.map((item) => {
          const isRootSection = item.href === "/admin" || item.href === "/agent";
          const active = isRootSection
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block min-w-fit rounded-2xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors whitespace-nowrap lg:w-full",
                active
                  ? "hover:bg-[#2a241f]"
                  : "hover:bg-[#f2ebe1]",
              )}
              style={
                active
                  ? {
                      backgroundColor: "#1f1a17",
                      color: "#f6f1ea",
                    }
                  : {
                      color: "#3f362f",
                    }
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
