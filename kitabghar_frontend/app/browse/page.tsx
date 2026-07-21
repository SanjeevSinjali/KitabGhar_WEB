/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { whoamiAction } from "@/lib/actions/auth-action";
import { handleGetFeaturedBooks } from "@/lib/actions/book-action";
import { handleGetWishlist } from "@/lib/actions/wishlist-action";
import BrowseGrid from "./_components/BrowseGrid";

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

  const [booksResult, wishlistResult] = await Promise.all([
    handleGetFeaturedBooks({ page, limit: 12 }),
    handleGetWishlist(),
  ]);

  const books = booksResult.success ? booksResult.data : [];
  const pagination = booksResult.success ? booksResult.pagination : undefined;
  const wishlistBooks = wishlistResult.success ? wishlistResult.data : [];
  const wishlistedIds = new Set<string>(
    wishlistBooks.map((item: any) => String(item.bookId))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Browse Books</h1>
          <p className="mt-1 text-sm text-slate-500">All available books</p>
        </div>

        <BrowseGrid books={books} wishlistedIds={wishlistedIds} pagination={pagination} />
      </main>
    </div>
  );
}