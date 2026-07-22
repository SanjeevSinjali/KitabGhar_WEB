"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { handleDeleteMyBook } from "@/lib/actions/book-action";

export default function DeleteListingButton({ bookId, title }: { bookId: string; title: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onDelete() {
    startTransition(async () => {
      await handleDeleteMyBook(bookId);
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
        title="Delete listing"
      >
        <Trash2 size={14} />
      </button>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="text-base font-semibold text-slate-900">Delete this listing?</h3>
            <p className="mt-2 text-sm text-slate-500">
              <span className="font-medium text-slate-700">&quot;{title}&quot;</span> will be permanently removed.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                disabled={isPending}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}