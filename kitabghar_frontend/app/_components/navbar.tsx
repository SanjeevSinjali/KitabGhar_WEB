import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center gap-3">
      <Link
        href="/login"
        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Register
      </Link>
    </nav>
  );
}