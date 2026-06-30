"use client";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle size={40} className="mb-4 text-red-400" />
      <h2 className="mb-2 text-lg font-bold text-slate-900">Something went wrong</h2>
      <p className="mb-6 text-sm text-slate-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-xl bg-[#1E3A5F] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#162d4a]"
      >
        Try again
      </button>
    </div>
  );
}