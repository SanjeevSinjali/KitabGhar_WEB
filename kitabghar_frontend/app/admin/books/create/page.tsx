import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BookForm from "../_components/BookForm";

export default function CreateBookPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/books"
        className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600"
      >
        <ArrowLeft size={14} />
        Back to books
      </Link>
      <h2 className="mb-6 mt-3 text-2xl font-bold text-slate-900">New Book Listing</h2>
      <BookForm />
    </div>
  );
}