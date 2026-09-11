"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Terminal,
  Wrench,
  ScrollText,
  Radio,
  Settings,
  Cpu,
  X,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/containers", label: "Containers", icon: Boxes },
  { href: "/commands", label: "Commands", icon: Terminal },
  { href: "/tools", label: "MCP Tools", icon: Wrench },
  { href: "/history", label: "History", icon: ScrollText },
  { href: "/logs", label: "Live Logs", icon: Radio },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div
        className="h-9 w-9 rounded-lg bg-slate-900 dark:bg-white
                   text-white dark:text-slate-900 flex items-center justify-center shrink-0"
      >
        <Cpu className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold heading leading-tight truncate">
          devops<span className="text-brand-500">_</span>mcp
        </div>
        <div className="text-[11px] muted leading-tight">Automation Platform</div>
      </div>
    </Link>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={"sidebar-link " + (active ? "active" : "")}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Static desktop sidebar — always visible at lg+ */
export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200
                 dark:border-white/10 bg-white dark:bg-[#0b0c10]
                 sticky top-0 h-screen"
    >
      <div className="px-5 py-5 border-b border-slate-200 dark:border-white/10">
        <Brand />
      </div>

      <NavLinks pathname={pathname} />

      <div className="px-5 py-4 border-t border-slate-200 dark:border-white/10 text-xs muted">
        <div className="font-medium heading mb-1">FYP 2025–2026</div>
        University of Sindh
        <br />
        Dept. of Information Technology
      </div>
    </aside>
  );
}

/** Slide-in drawer sidebar — shown below lg when toggled from the TopBar */
export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <div
      className={
        "fixed inset-0 z-50 lg:hidden transition-opacity duration-200 " +
        (open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")
      }
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        className={
          "absolute left-0 top-0 h-full w-72 max-w-[85vw] flex flex-col bg-white dark:bg-[#0b0c10] " +
          "border-r border-slate-200 dark:border-white/10 shadow-2xl transition-transform duration-200 " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="px-5 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost p-1.5 shrink-0"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <NavLinks pathname={pathname} onNavigate={onClose} />

        <div className="px-5 py-4 border-t border-slate-200 dark:border-white/10 text-xs muted">
          <div className="font-medium heading mb-1">FYP 2025–2026</div>
          University of Sindh
          <br />
          Dept. of Information Technology
        </div>
      </aside>
    </div>
  );
}
