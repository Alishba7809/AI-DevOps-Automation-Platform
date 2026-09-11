"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Cpu, Loader2, Moon, Sun, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, user, authEnabled, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const next = params.get("next") || "/";

  useEffect(() => {
    if (loading) return;
    if (!authEnabled || user) router.replace(next);
  }, [loading, authEnabled, user, router, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-slate-50 dark:bg-slate-950">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-md
                   text-slate-500 hover:text-slate-900 hover:bg-slate-100
                   dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800
                   transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-md
                          bg-slate-900 dark:bg-white text-white dark:text-slate-900
                          mb-4">
            <Cpu className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            devops<span className="text-indigo-500">_</span>mcp
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Sign in to continue to the dashboard
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800
                        bg-white dark:bg-slate-900 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700
                           bg-white dark:bg-slate-800 px-3 py-2 text-sm
                           text-slate-900 dark:text-white placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-colors"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700
                           bg-white dark:bg-slate-800 px-3 py-2 text-sm
                           text-slate-900 dark:text-white placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md bg-red-50 dark:bg-red-500/10
                              px-3 py-2.5 text-sm text-red-700 dark:text-red-300
                              ring-1 ring-red-200 dark:ring-red-500/20">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center rounded-md
                         bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white
                         hover:bg-indigo-500 active:bg-indigo-700
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                         focus:ring-offset-white dark:focus:ring-offset-slate-900
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500
                         dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Create one
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          University of Sindh · Department of Information Technology · FYP 2025–2026
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}