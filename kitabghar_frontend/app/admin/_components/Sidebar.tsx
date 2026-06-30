"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, ArrowLeft } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/books", label: "Books", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-50 md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="h-5 w-1 rounded-full bg-[#1E3A5F]" />
        <span className="text-sm font-bold uppercase tracking-widest text-slate-900">
          Admin
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-white text-[#1E3A5F] shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-slate-700"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
        >
          <ArrowLeft size={14} />
          Back to app
        </Link>
      </div>
    </aside>
  );
}