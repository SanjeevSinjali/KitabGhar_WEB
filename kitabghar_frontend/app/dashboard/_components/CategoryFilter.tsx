"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { BOOK_CATEGORIES } from "@/lib/constants";

export default function CategoryFilter({ basePath }: { basePath: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("category") ?? "";

  function selectCategory(category: string) {
    const q = new URLSearchParams(params.toString());
    if (category) {
      q.set("category", category);
    } else {
      q.delete("category");
    }
    q.delete("page");
    router.push(`${basePath}?${q.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => selectCategory("")}
        className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
          active === ""
            ? "bg-[#1E3A5F] text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        All
      </button>
      {BOOK_CATEGORIES.map((c) => (
        <button
          key={c}
          onClick={() => selectCategory(c)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
            active === c
              ? "bg-[#1E3A5F] text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}