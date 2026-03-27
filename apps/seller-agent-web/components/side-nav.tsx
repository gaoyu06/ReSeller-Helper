"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

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
      <div className="px-2 text-[11px] tracking-[0.08em] text-zinc-500">
        {title}
      </div>
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(`${item.href}/`));

        return (
          <Button
            key={item.href}
            asChild
            variant={active ? "default" : "outline"}
            className="justify-start rounded-xl"
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
