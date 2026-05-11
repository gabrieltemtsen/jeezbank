"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const Icon = {
  Home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  ),
  Cards: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 10h18" />
      <path d="M7 15h3" />
    </svg>
  ),
  Activity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    </svg>
  ),
  Profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  ),
};

const items: NavItem[] = [
  { href: "/home", label: "Home", icon: Icon.Home },
  { href: "/fund", label: "Add", icon: Icon.Cards },
  { href: "/transactions", label: "Activity", icon: Icon.Activity },
  { href: "/profile", label: "Profile", icon: Icon.Profile },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 jmb-nav-safe">
      <div className="mx-auto max-w-md px-4">
        <div className="jmb-glass-hi rounded-2xl px-2 py-2 flex items-center justify-around shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.6)]">
          {items.map((it) => {
            const active = pathname === it.href || (it.href !== "/home" && pathname?.startsWith(it.href));
            return (
              <Link
                key={it.href}
                href={it.href}
                className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition"
              >
                <span className={`flex items-center justify-center w-10 h-9 rounded-xl transition ${active ? "text-[#06121a]" : "text-[var(--jmb-text-dim)]"}`}>
                  {active && (
                    <span className="absolute inset-x-3 top-1.5 bottom-1.5 rounded-xl"
                          style={{ background: "var(--jmb-grad-primary)" }} />
                  )}
                  <span className="relative">{it.icon}</span>
                </span>
                <span className={`relative text-[10px] font-medium tracking-wide ${active ? "text-white" : "text-[var(--jmb-text-mute)]"}`}>
                  {it.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
