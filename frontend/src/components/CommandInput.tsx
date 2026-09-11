"use client";

import { useEffect, useState } from "react";
import { Play, TestTube2, AlertTriangle, Loader2, ChevronRight } from "lucide-react";

interface Props {
  onExecute: (
    command: string,
    opts: { dry_run: boolean; confirm_destructive: boolean }
  ) => Promise<void>;
  loading: boolean;
  compact?: boolean;
  initialValue?: string;
}

const SAMPLE_COMMANDS = [
  "deploy nginx on port 8080",
  "deploy rabbitmq",
  "deploy mongodb",
  "list all containers",
  "system health",
  "disk usage",
  "analyze logs at /data/sample.log",
  "count lines in package.json",
];

export default function CommandInput({
  onExecute,
  loading,
  compact,
  initialValue,
}: Props) {
  const [command, setCommand] = useState(initialValue ?? "");
  const [dryRun, setDryRun] = useState(false);
  const [confirmDestructive, setConfirmDestructive] = useState(false);

  // Keep internal state in sync when parent passes a new prompt
  useEffect(() => {
    if (initialValue !== undefined) setCommand(initialValue);
  }, [initialValue]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!command.trim()) return;
    await onExecute(command, {
      dry_run: dryRun,
      confirm_destructive: confirmDestructive,
    });
  }

  return (
    <div className="card overflow-hidden">
      {/* Terminal window chrome */}
      <div className="terminal-chrome bg-slate-50 dark:bg-white/[0.02]">
        <span className="terminal-dot bg-red-400/80" />
        <span className="terminal-dot bg-amber-400/80" />
        <span className="terminal-dot bg-emerald-400/80" />
        <span className="ml-3 text-xs muted tracking-wide">mcp-router — natural language command</span>
      </div>

      <form onSubmit={handleSubmit} className={compact ? "p-4 space-y-3" : "p-5 space-y-4"}>
        <div
          className="flex items-center gap-2 rounded-md border border-slate-300 bg-white
                     dark:border-white/10 dark:bg-black/40 focus-within:border-slate-400
                     dark:focus-within:border-white/25 transition pl-3 pr-1.5 py-1.5"
        >
          <ChevronRight className="h-4 w-4 text-brand-500 shrink-0" />
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder='deploy nginx on port 8080'
            className="flex-1 min-w-0 bg-transparent text-sm py-1.5 outline-none
                       placeholder:text-slate-400 dark:placeholder:text-slate-600"
            disabled={loading}
          />
          <button
            type="submit"
            className="btn-primary px-4 py-1.5 shrink-0"
            disabled={loading || !command.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Execute
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDryRun((v) => !v)}
            className={
              "inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition " +
              (dryRun
                ? "border-amber-400/50 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30"
                : "border-slate-200 dark:border-white/10 muted hover:border-slate-300 dark:hover:border-white/20")
            }
          >
            <TestTube2 className="h-3.5 w-3.5" />
            dry-run
          </button>
          <button
            type="button"
            onClick={() => setConfirmDestructive((v) => !v)}
            className={
              "inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition " +
              (confirmDestructive
                ? "border-red-400/50 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30"
                : "border-slate-200 dark:border-white/10 muted hover:border-slate-300 dark:hover:border-white/20")
            }
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            confirm destructive
          </button>
        </div>
      </form>

      {!compact && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-200 dark:border-white/10">
          <p className="text-[10px] font-medium muted mb-2 tracking-wider uppercase pt-4">
            Quick examples
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_COMMANDS.map((sample) => (
              <button
                key={sample}
                onClick={() => setCommand(sample)}
                className="text-xs px-3 py-1.5 rounded-md font-mono
                           bg-slate-100 text-slate-700 hover:bg-slate-200
                           dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10
                           transition"
                type="button"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
