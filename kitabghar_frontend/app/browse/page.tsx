/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { whoamiAction } from "@/lib/actions/auth-action";
import { handleGetFeaturedBooks, handleSearchBooks } from "@/lib/actions/book-action";
import { handleGetWishlist } from "@/lib/actions/wishlist-action";
import BrowseGrid from "./_components/BrowseGrid";
import CategoryFilter from "@/app/dashboard/_components/CategoryFilter";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await whoamiAction();
  if (!user) {
    redirect("/login");
  }

  const query = await searchParams;
  const page = query.page ? parseInt(query.page as string, 10) : 1;
  const search = query.search ? (query.search as string) : "";
  const category = query.category ? (query.category as string) : "";

  const wishlistResult = await handleGetWishlist();

  let books: any[] = [];
  let pagination: any = undefined;

  if (search) {
    const searchResult = await handleSearchBooks(search);
    books = searchResult.success ? searchResult.data : [];
  } else {
    const booksResult = await handleGetFeaturedBooks({ page, limit: 12, category });
    books = booksResult.success ? booksResult.data : [];
    pagination = booksResult.success ? booksResult.pagination : undefined;
  }

  const wishlistBooks = wishlistResult.success ? wishlistResult.data : [];
  const wishlistedIds = new Set<string>(
    wishlistBooks.map((item: any) => String(item.bookId))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {search ? `Results for "${search}"` : "Browse Books"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {search ? `${books.length} book(s) found` : "All available books"}
          </p>
        </div>

        {!search && (
          <div className="mb-6">
            <CategoryFilter basePath="/browse" />
          </div>
        )}

        <BrowseGrid books={books} wishlistedIds={wishlistedIds} pagination={pagination} />
      </main>
    </div>
  );
}