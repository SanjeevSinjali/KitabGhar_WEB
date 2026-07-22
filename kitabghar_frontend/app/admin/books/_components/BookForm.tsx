"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ImagePlus } from "lucide-react";
import { adminBookSchema, type AdminBookFormInput, type AdminBookFormData } from "./schema";
import { handleCreateBook } from "@/lib/actions/book-action";
import { BOOK_CATEGORIES } from "@/lib/constants";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]";
const noSpinnerClass =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const errClass = "mt-1 text-xs text-red-500";

export default function BookForm() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminBookFormInput, unknown, AdminBookFormData>({
    resolver: zodResolver(adminBookSchema),
    defaultValues: { condition: "Good", category: "Other" },
  });

  const imageField = register("image", {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setPreview(file ? URL.createObjectURL(file) : null);
    },
  });

  const onSubmit = async (data: AdminBookFormData) => {
    setError("");
    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("author", data.author);
    fd.append("price", String(data.price));
    fd.append("condition", data.condition);
    fd.append("category", data.category);
    if (data.description) fd.append("description", data.description);
    fd.append("image", data.image[0]);

    const result = await handleCreateBook(fd);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.message || "Failed to create book listing");
      return;
    }

    router.push("/admin/books");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <ImagePlus size={22} />
                <span className="text-xs">Upload photo</span>
              </div>
            )}
          </div>
          <input
            {...imageField}
            ref={(el) => {
              imageField.ref(el);
              fileRef.current = el;
            }}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          {errors.image && (
            <p className="mt-1 text-center text-xs text-red-500">
              {errors.image.message as string}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Title</label>
          <input {...register("title")} type="text" placeholder="e.g. Clean Code" className={inputClass} />
          {errors.title && <span className={errClass}>{errors.title.message}</span>}
        </div>

        <div>
          <label className={labelClass}>Author</label>
          <input {...register("author")} type="text" placeholder="e.g. Robert C. Martin" className={inputClass} />
          {errors.author && <span className={errClass}>{errors.author.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Price (Rs.)</label>
            <input
              {...register("price")}
              type="number"
              step="0.01"
              placeholder="1050"
              className={`${inputClass} ${noSpinnerClass}`}
            />
            {errors.price && <span className={errClass}>{errors.price.message}</span>}
          </div>
          <div>
            <label className={labelClass}>Condition</label>
            <select {...register("condition")} className={inputClass}>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
            {errors.condition && <span className={errClass}>{errors.condition.message}</span>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select {...register("category")} className={inputClass}>
            {BOOK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && <span className={errClass}>{errors.category.message}</span>}
        </div>

        <div>
          <label className={labelClass}>Description (optional)</label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Condition details, edition, any notes for buyers..."
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]"
          />
          {errors.description && <span className={errClass}>{errors.description.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Creating..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
}