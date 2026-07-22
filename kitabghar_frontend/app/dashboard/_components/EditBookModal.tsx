"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, ImagePlus, Pencil } from "lucide-react";
import { handleUpdateBook } from "@/lib/actions/book-action";
import { BOOK_CATEGORIES } from "@/lib/constants";

type EditableBook = {
  _id: string;
  title: string;
  author: string;
  price: number;
  condition: "Like New" | "Good" | "Fair";
  category?: string;
  description?: string;
  image: string;
};

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]";
const noSpinnerClass =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export default function EditBookModal({ book }: { book: EditableBook }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [price, setPrice] = useState(String(book.price));
  const [condition, setCondition] = useState(book.condition);
  const [category, setCategory] = useState(book.category ?? "Other");
  const [description, setDescription] = useState(book.description ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  function close() {
    setOpen(false);
    setError("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("author", author);
      fd.append("price", price);
      fd.append("condition", condition);
      fd.append("category", category);
      fd.append("description", description);
      if (file) fd.append("image", file);

      const result = await handleUpdateBook(book._id, fd);
      if (!result.success) {
        setError(result.message || "Failed to update book");
        return;
      }
      close();
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
      >
        <Pencil size={12} /> Edit
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={close}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Edit Listing</h3>
              <button
                onClick={close}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className={labelClass}>Book Photo</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="mx-auto flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50"
                >
                  {preview ? (
                    <img src={preview} alt="Book preview" className="h-full w-full object-cover" />
                  ) : book.image ? (
                    <img src={book.image} alt={book.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <ImagePlus size={22} />
                      <span className="text-xs">Upload photo</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="mt-1 text-center text-xs text-slate-400">Tap to replace photo (optional)</p>
              </div>

              <div>
                <label className={labelClass}>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Author</label>
                <input value={author} onChange={(e) => setAuthor(e.target.value)} type="text" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Price (Rs.)</label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    type="number"
                    step="0.01"
                    className={`${inputClass} ${noSpinnerClass}`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as "Like New" | "Good" | "Fair")}
                    className={inputClass}
                  >
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  {BOOK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-50"
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}