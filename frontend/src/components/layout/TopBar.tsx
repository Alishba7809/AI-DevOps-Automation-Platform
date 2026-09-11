"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut, UserCircle2, Shield, Wrench, Menu } from "lucide-react";
import HealthBadge from "@/components/HealthBadge";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

export default function TopBar({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick?: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const { user, authEnabled, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const roleIcon =
    user?.role === "admin" ? (
      <Shield className="h-3 w-3" />
    ) : user?.role === "developer" ? (
      <Wrench className="h-3 w-3" />
    ) : (
      <UserCircle2 className="h-3 w-3" />
    );

  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4
                 border-b border-slate-200 bg-white/80 px-4 sm:px-6 backdrop-blur
                 dark:border-white/10 dark:bg-[#08090c]/80"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="btn-ghost p-1.5 -ml-1.5 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold heading truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <HealthBadge />
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="btn-ghost px-2"
          aria-label="Toggle theme"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {authEnabled && user ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5
                         hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <div
                className="h-8 w-8 rounded-md bg-slate-900 dark:bg-white
                           text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold"
              >
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium heading leading-tight">
                  {user.username}
                </div>
                <div className="text-xs muted flex items-center gap-1">
                  {roleIcon}
                  {user.role}
                </div>
              </div>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-lg bg-white ring-1
                           ring-slate-200 shadow-lg dark:bg-[#0e0f13] dark:ring-white/10
                           overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10">
                  <div className="text-sm font-medium heading">
                    {user.username}
                  </div>
                  <div className="text-xs muted">{user.email}</div>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/settings");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm
                               text-slate-700 hover:bg-slate-100
                               dark:text-slate-200 dark:hover:bg-white/5"
                  >
                    <UserCircle2 className="h-4 w-4" />
                    Profile & Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      router.replace("/login");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm
                               text-red-600 hover:bg-red-50
                               dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
