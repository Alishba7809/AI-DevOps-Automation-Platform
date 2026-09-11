"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Cpu,
  Loader2,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

export default function RegisterPage() {
  const router = useRouter();

  const { register, user, authEnabled, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!authEnabled || user) {
      router.replace("/");
    }
  }, [loading, authEnabled, user, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        username: cleanUsername,
        email: cleanEmail,
        password,
      });

      router.replace("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating your account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950">
      {/* Theme button */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="
          absolute right-5 top-5
          flex h-10 w-10 items-center justify-center
          rounded-xl
          border border-slate-300
          bg-white
          text-slate-700
          shadow-sm
          transition
          hover:bg-slate-100
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500
          dark:border-slate-700
          dark:bg-slate-900
          dark:text-slate-200
          dark:hover:bg-slate-800
        "
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>

      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
        <div className="w-full">
          {/* Header */}
          <div className="mb-8 text-center">
            <div
              className="
                mx-auto mb-4
                flex h-14 w-14
                items-center justify-center
                rounded-2xl
                bg-indigo-600
                text-white
                shadow-lg shadow-indigo-600/20
              "
            >
              <Cpu className="h-7 w-7" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create your account
            </h1>

            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              The first account becomes the administrator
            </p>
          </div>

          {/* Card */}
          <div
            className="
              rounded-2xl
              border border-slate-200
              bg-white
              p-6
              shadow-xl shadow-slate-200/60
              sm:p-8
              dark:border-slate-800
              dark:bg-slate-900
              dark:shadow-black/20
            "
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  required
                  minLength={3}
                  maxLength={64}
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ammar"
                  className="
                    h-11 w-full
                    rounded-xl
                    border border-slate-300
                    bg-white
                    px-4
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    hover:border-slate-400
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-500/10
                    dark:border-slate-700
                    dark:bg-slate-950
                    dark:text-white
                    dark:placeholder:text-slate-500
                    dark:hover:border-slate-600
                  "
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="
                    h-11 w-full
                    rounded-xl
                    border border-slate-300
                    bg-white
                    px-4
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    hover:border-slate-400
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-500/10
                    dark:border-slate-700
                    dark:bg-slate-950
                    dark:text-white
                    dark:placeholder:text-slate-500
                    dark:hover:border-slate-600
                  "
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="
                    h-11 w-full
                    rounded-xl
                    border border-slate-300
                    bg-white
                    px-4
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    hover:border-slate-400
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-500/10
                    dark:border-slate-700
                    dark:bg-slate-950
                    dark:text-white
                    dark:placeholder:text-slate-500
                    dark:hover:border-slate-600
                  "
                />

                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  Use at least 8 characters.
                </p>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Enter your password again"
                  className="
                    h-11 w-full
                    rounded-xl
                    border border-slate-300
                    bg-white
                    px-4
                    text-sm
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    hover:border-slate-400
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-500/10
                    dark:border-slate-700
                    dark:bg-slate-950
                    dark:text-white
                    dark:placeholder:text-slate-500
                    dark:hover:border-slate-600
                  "
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  className="
                    flex items-start gap-3
                    rounded-xl
                    border border-red-200
                    bg-red-50
                    p-3
                    text-sm text-red-700
                    dark:border-red-900/50
                    dark:bg-red-950/40
                    dark:text-red-300
                  "
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="
                  mt-2
                  flex h-11 w-full
                  items-center justify-center
                  rounded-xl
                  bg-indigo-600
                  px-4
                  text-sm font-semibold
                  text-white
                  shadow-md shadow-indigo-600/20
                  transition
                  hover:bg-indigo-700
                  focus:outline-none
                  focus:ring-4
                  focus:ring-indigo-500/20
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            {/* Login link */}
            <div className="mt-7 border-t border-slate-200 pt-6 text-center dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="
                    font-semibold
                    text-indigo-600
                    transition
                    hover:text-indigo-700
                    hover:underline
                    dark:text-indigo-400
                    dark:hover:text-indigo-300
                  "
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}