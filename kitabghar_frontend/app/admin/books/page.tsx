import { handleGetAllBooks } from "@/lib/actions/admin/book-action";
import BookTable from "./_components/BookTable";

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const page = query.page ? parseInt(query.page as string, 10) : 1;
  const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
  const search = query.search ? (query.search as string) : "";

  const result = await handleGetAllBooks({ page, limit, search });

  if (!result.success) {
    return (
      <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-medium text-red-600">
          {result.message || "Failed to load books"}
        </p>
        <p className="mt-1 text-xs text-red-400">
          Make sure you are logged in as an admin.
        </p>
      </div>
    );
  }

  return (
    <BookTable
      data={result.data || []}
      pagination={result.pagination}
      search={search}
    />
  );
}