import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { BookOpen, ShoppingBag, Heart, Star, Package, Search, PlusCircle } from "lucide-react";

const browseBooks = [
  { id: 1, title: "Clean Code", author: "Robert C.Martin", price: "Rs. 1050", condition: "Good", image: "/book_1.jpg" },
  { id: 2, title: "Algorithm", author: "Thomas H.Corme", price: "Rs. 1050", condition: "Like New", image: "/book_2.jpg" },
  { id: 3, title: "Computer Networking", author: "James F.Kurose", price: "Rs. 1050", condition: "Fair", image: "/book_3.jpg" },
  { id: 4, title: "Design Patterns", author: "Richard Helm", price: "Rs. 1050", condition: "Good", image: "/book_4.jpg" },
  { id: 5, title: "The Pragmatic Programmer", author: "Andrew Hunt", price: "Rs. 1050", condition: "Like New", image: "/book_5.jpg" },
  { id: 6, title: "Database System Concepts", author: "Henry F.Korth", price: "Rs. 1050", condition: "Good", image: "/book_6.jpg" },
];

const myListedBooks: { id: number; title: string; price: string; status: string; image: string }[] = [];

const recentActivity: { id: number; type: string; text: string; time: string }[] = [];

const stats = [
  { label: "Books Browsed", value: "0", icon: BookOpen, color: "bg-blue-50 text-blue-600" },
  { label: "Purchases", value: "0", icon: ShoppingBag, color: "bg-green-50 text-green-600" },
  { label: "Wishlist", value: "0", icon: Heart, color: "bg-pink-50 text-pink-600" },
  { label: "My Listings", value: "0", icon: Package, color: "bg-purple-50 text-purple-600" },
];

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("kitabghar_user")?.value;

  const user = userCookie
    ? (JSON.parse(userCookie) as { id: string; name: string; email: string })
    : { id: "", name: "User", email: "" };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/kitabghar_logo.png" alt="KitabGhar logo" width={40} height={40} className="rounded-xl object-contain" />
            <span className="text-lg font-bold text-slate-900">KitabGhar</span>
          </Link>

          <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 w-72">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search books..."
              className="bg-transparent text-sm outline-none placeholder:text-slate-400 w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E3A5F] text-sm font-semibold text-white">
                {initials}
              </div>
              <span className="text-sm font-medium text-slate-700">{user.name}</span>
            </div>
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Discover books, manage your listings, and track your activity.</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`mb-3 inline-flex rounded-xl p-2.5 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-0.5 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Browse Books */}
        <div className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Browse Books</h2>
              <p className="text-sm text-slate-500">Available Books</p>
            </div>
            <button className="text-sm font-medium text-[#1E3A5F] hover:underline">View all</button>
          </div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {browseBooks.map((book) => (
              <div key={book.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="relative aspect-[3/4] w-full bg-slate-100">
                  <Image src={book.image} alt={book.title} fill sizes="(max-width: 768px) 50vw, 16vw" className="object-cover" />
                  <button className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-pink-500">
                    <Heart size={14} />
                  </button>
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-slate-900">{book.title}</p>
                  <p className="truncate text-xs text-slate-500">{book.author}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1E3A5F]">{book.price}</span>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${book.condition === "Like New" ? "bg-green-100 text-green-700" : book.condition === "Good" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {book.condition}
                    </span>
                  </div>
                  <button className="mt-2 w-full rounded-lg bg-[#1E3A5F] py-1.5 text-xs font-medium text-white transition hover:bg-[#162d4a]">
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* My Listings */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">My Listings</h2>
              <button className="flex items-center gap-1.5 rounded-xl bg-[#1E3A5F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#162d4a]">
                <PlusCircle size={15} /> Sell a Book
              </button>
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
                  <div key={book.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <Image src={book.image} alt={book.title} fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-slate-900">{book.title}</p>
                      <p className="text-sm text-slate-500">{book.price}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${book.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {book.status}
                    </span>
                    <button className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                      Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Profile Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E3A5F] text-2xl font-bold text-white">
                  {initials}
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">{user.name}</h3>
                <p className="text-sm text-slate-500">{user.email}</p>
                <div className="mt-3 flex items-center gap-1 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-medium text-slate-700">New Member</span>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900">0</p>
                  <p className="text-xs text-slate-500">Listed</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900">0</p>
                  <p className="text-xs text-slate-500">Purchased</p>
                </div>
              </div>
              <button className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Edit Profile
              </button>
            </div>

            {/* Recent Activity */}
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
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.type === "sold" ? "bg-green-100 text-green-600" : item.type === "bought" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                        <Package size={14} />
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