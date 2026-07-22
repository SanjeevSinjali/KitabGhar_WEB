import Link from "next/link";
import Image from "next/image";

const featuredBooks = [
  {
    title: "Algorithms",
    subtitle: "Learn problem solving and data structures",
    image: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/18c86132cddbd976794e03ef7fc8ce63fa47feb8.jpg",
  },
  {
    title: "Flutter",
    subtitle: "Build beautiful cross-platform apps",
    image: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/5efd9af4b49a8dd8edb53e37d805ed0e5f009d56.jpg",
  },
  {
    title: "Web Development",
    subtitle: "HTML, CSS, JavaScript, and modern web apps",
    image: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/dbd1d1df779e3494b5cb4b0396b08f847d5f9cf0.jpg",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <span className="inline-flex rounded-full bg-sky-100 px-4 py-1 text-sm font-medium text-sky-700">
            New place for second-hand books
          </span>
          <h2 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
            Give unwanted books a new home.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            KitabGhar is a simple marketplace where anyone can sell books they no longer need —
            novels, academic books, guides, and more.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="rounded-xl bg-slate-900 px-6 py-3 text-center font-medium text-white transition hover:bg-slate-800">
              Get Started
            </Link>
            <Link href="/login" className="rounded-xl border border-slate-300 px-6 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-100">
              Sign In
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
            <Image src="/kitabghar_logo.png" alt="KitabGhar logo" width={56} height={56} className="rounded-2xl object-contain" />
            <div>
              <h3 className="text-xl font-semibold">KitabGhar</h3>
              <p className="text-sm text-slate-500">Trusted platform for book exchange</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Sell books easily</p>
              <p className="mt-1 text-sm text-slate-600">List novels, textbooks, and more in just a few steps.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Find affordable reads</p>
              <p className="mt-1 text-sm text-slate-600">Discover books from other users at lower prices.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Simple and clean</p>
              <p className="mt-1 text-sm text-slate-600">A smooth experience designed for everyday users.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h3 className="text-2xl font-bold">Featured books</h3>
          <p className="mt-2 text-slate-600">Popular picks for learners and developers.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredBooks.map((book) => (
            <div key={book.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="relative aspect-[3/4] w-full bg-slate-100">
                <Image src={book.image} alt={book.title} fill sizes="(max-width: 760px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="p-5">
                <h4 className="text-lg font-semibold">{book.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{book.subtitle}</p>
                <Link
                  href="/login"
                  className="mt-5 block w-full rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Buy Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}