/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { whoamiAction } from "@/lib/actions/auth-action";
import { handleGetMyBooks, handleGetFeaturedBooks } from "@/lib/actions/book-action";
import { handleGetWishlist } from "@/lib/actions/wishlist-action";
import { handleGetPurchases } from "@/lib/actions/purchase-action";
import { BookOpen, ShoppingBag, Star, Package, Heart, Search } from "lucide-react";
import LogoutButton from "@/app/_components/logoutbutton";
import SellBookModal from "@/app/dashboard/_components/SellBookModal";
import BrowseBooksSlider from "@/app/dashboard/_components/BrowseBooksSlider";
import NotificationBell from "@/app/dashboard/_components/NotificationBell";

type MyBook = {
  _id: string;
  title: string;
  author: string;
  price: number;
  condition: "Like New" | "Good" | "Fair";
  image: string;
  status: "Active" | "Sold";
  createdAt: string;
};

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default async function DashboardPage() {
  const user = await whoamiAction();
  if (!user) {
    redirect("/login");
  }

  const [booksResult, featuredResult, wishlistResult, purchasesResult] = await Promise.all([
    handleGetMyBooks(),
    handleGetFeaturedBooks({ limit: 6 }),
    handleGetWishlist(),
    handleGetPurchases(),
  ]);

  const myListedBooks: MyBook[] = booksResult.success ? booksResult.data : [];
  const featuredBooks = featuredResult.success ? featuredResult.data : [];
  const wishlistBooks = wishlistResult.success ? wishlistResult.data : [];
  const purchases = purchasesResult.success ? purchasesResult.data : [];
  const wishlistedIds = new Set<string>(
    wishlistBooks.map((item: any) => String(item.bookId))
  );

  const listingActivity = myListedBooks.map((book) => ({
    id: `listing-${book._id}`,
    type: "listed" as const,
    text: `You listed "${book.title}" for Rs. ${book.price}`,
    time: book.createdAt,
  }));

  const wishlistActivity = wishlistBooks.map((item: any) => ({
    id: `wishlist-${item._id}`,
    type: "wishlisted" as const,
    text: `You added "${item.title}" to your wishlist`,
    time: item.createdAt,
  }));

  const purchaseActivity = purchases.map((item: any) => ({
    id: `purchase-${item._id}`,
    type: "purchased" as const,
    text: `You bought "${item.title}" for ${item.price}`,
    time: item.createdAt,
  }));

  const recentActivity = [...listingActivity, ...wishlistActivity, ...purchaseActivity]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5)
    .map((item) => ({ ...item, time: formatRelativeTime(item.time) }));

  const stats = [
    { label: "Books Browsed", value: "0", icon: BookOpen, color: "bg-blue-50 text-blue-600", href: null },
    { label: "Purchases", value: String(purchases.length), icon: ShoppingBag, color: "bg-green-50 text-green-600", href: "/purchases" },
    { label: "Wishlist", value: String(wishlistBooks.length), icon: Heart, color: "bg-pink-50 text-pink-600", href: "/wishlist" },
    { label: "My Listings", value: String(myListedBooks.length), icon: Package, color: "bg-purple-50 text-purple-600", href: null },
  ];

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/kitabghar_logo.png" alt="KitabGhar logo" width={40} height={40} className="rounded-xl object-contain h-auto w-auto" />
            <span className="text-lg font-bold text-slate-900">KitabGhar</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 w-72">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Search books..." className="bg-transparent text-sm outline-none placeholder:text-slate-400 w-full" />
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              {user.avatar ? (
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image src={user.avatar} alt={user.name} fill sizes="32px" className="object-cover" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E3A5F] text-sm font-semibold text-white">
                  {initials}
                </div>
              )}
              <span className="text-sm font-medium text-slate-700">{user.name}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Discover books, manage your listings, and track your activity.</p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => {
            const CardInner = (
              <>
                <div className={`mb-3 inline-flex rounded-xl p-2.5 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-0.5 text-sm text-slate-500">{stat.label}</p>
              </>
            );

            if (stat.href) {
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300"
                >
                  {CardInner}
                </Link>
              );
            }

            return (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                {CardInner}
              </div>
            );
          })}
        </div>

        <div className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Browse Books</h2>
              <p className="text-sm text-slate-500">Available Books</p>
            </div>
            <Link href="/browse" className="text-sm font-medium text-[#1E3A5F] hover:underline">
              View all
            </Link>
          </div>
          <BrowseBooksSlider books={featuredBooks} wishlistedIds={wishlistedIds} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">My Listings</h2>
              <SellBookModal />
            </div>
            <div className="space-y-3">
              {myListedBooks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <Package size={32} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-500">No listings yet</p>
                  <p className="mt-1 text-xs text-slate-400">Click &quot;Sell a Book&quot; to list your first book</p>
                </div>
              ) : (
                myListedBooks.map((book) => (
                  <div key={book._id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                    <div className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                      {book.image ? (
                        <Image src={book.image} alt={book.title} fill sizes="48px" className="object-cover" />
                      ) : (
                        <Package size={16} className="text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-slate-900">{book.title}</p>
                      <p className="text-sm text-slate-500">Rs. {book.price}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${book.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {book.status}
                    </span>
                    <button className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">Edit</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                {user.avatar ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-full">
                    <Image src={user.avatar} alt={user.name} fill sizes="64px" className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E3A5F] text-2xl font-bold text-white">
                    {initials}
                  </div>
                )}
                <h3 className="mt-3 font-semibold text-slate-900">{user.name}</h3>
                <p className="text-sm text-slate-500">{user.email}</p>
                <div className="mt-3 flex items-center gap-1 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-medium text-slate-700">New Member</span>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900">{myListedBooks.length}</p>
                  <p className="text-xs text-slate-500">Listed</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900">{purchases.length}</p>
                  <p className="text-xs text-slate-500">Purchased</p>
                </div>
              </div>
              <Link
                href="/profile"
                className="mt-4 block w-full rounded-xl border border-slate-200 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Edit Profile
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">My Purchases</h3>
                <Link href="/purchases" className="text-xs font-medium text-[#1E3A5F] hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {purchases.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                    <p className="text-sm text-slate-400">No purchases yet</p>
                  </div>
                ) : (
                  purchases.slice(0, 5).map((item: any) => (
                    <Link
                      key={item._id}
                      href="/purchases"
                      className="flex items-center gap-3 rounded-lg transition hover:bg-slate-50 -mx-2 px-2 py-1"
                    >
                      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <Image src={item.image} alt={item.title} fill sizes="36px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.price}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                    <p className="text-sm text-slate-400">No recent activity yet</p>
                  </div>
                ) : (
                  recentActivity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          item.type === "wishlisted"
                            ? "bg-pink-100 text-pink-600"
                            : item.type === "purchased"
                            ? "bg-green-100 text-green-600"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {item.type === "wishlisted" ? (
                          <Heart size={14} />
                        ) : item.type === "purchased" ? (
                          <ShoppingBag size={14} />
                        ) : (
                          <Package size={14} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-slate-700">{item.text}</p>
                        <p className="text-xs text-slate-400">{item.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}