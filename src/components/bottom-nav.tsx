"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Beer, Home, UserRound, Radio } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/log-drink", label: "Log", icon: Beer },
  { href: "/activity", label: "Feed", icon: Radio },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink/95 px-2 pb-3 pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold transition active:scale-95 ${active ? "bg-neon text-ink" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
