"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, BookOpen } from "lucide-react";
import { handleSearchBooks } from "@/lib/actions/book-action";

type SuggestionBook = {
  _id: string;
  title: string;
  author: string;
  price: number;
  image: string;
};

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionBook[]>([]);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function onChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length === 0) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const result = await handleSearchBooks(value.trim());
        if (result.success) {
          setSuggestions(result.data);
          setOpen(true);
        }
      });
    }, 300);
  }

  function goToResults(term?: string) {
    const q = (term ?? query).trim();
    if (!q) return;
    setOpen(false);
    router.push(`/browse?search=${encodeURIComponent(q)}`);
  }

  return (
    <div ref={boxRef} className="relative w-72">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => query && suggestions.length > 0 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") goToResults();
          }}
          placeholder="Search books..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-20 mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {suggestions.map((book) => (
            <button
              key={book._id}
              onClick={() => goToResults(book.title)}
              className="flex w-full items-center gap-3 border-b border-slate-100 px-3 py-2.5 text-left transition last:border-0 hover:bg-slate-50"
            >
              <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded bg-slate-100">
                {book.image ? (
                  <Image src={book.image} alt={book.title} fill sizes="32px" className="object-cover" />
                ) : (
                  <BookOpen size={14} className="m-auto text-slate-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{book.title}</p>
                <p className="truncate text-xs text-slate-500">{book.author}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-[#1E3A5F]">Rs. {book.price}</span>
            </button>
          ))}
          <button
            onClick={() => goToResults()}
            className="w-full px-3 py-2.5 text-center text-xs font-medium text-[#1E3A5F] hover:bg-slate-50"
          >
            See all results for &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  );
}