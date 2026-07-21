import { redirect } from "next/navigation";
import { whoamiAction } from "@/lib/actions/auth-action";
import { handleGetWishlist } from "@/lib/actions/wishlist-action";
import WishlistGrid from "./_components/WishlistGrid";

export default async function WishlistPage() {
  const user = await whoamiAction();
  if (!user) {
    redirect("/login");
  }

  const result = await handleGetWishlist();
  const items = result.success ? result.data : [];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>
          <p className="mt-1 text-sm text-slate-500">
            Books you&apos;ve saved for later — up to 5 at a time.
          </p>
        </div>

        <WishlistGrid items={items} />
      </main>
    </div>
  );
}