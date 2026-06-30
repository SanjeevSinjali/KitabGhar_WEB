import Link from "next/link";
import { Users, BookOpen, ShieldCheck } from "lucide-react";
import { getUserData } from "@/lib/cookies";

export default async function AdminPage() {
  const user = await getUserData() ?? { name: "Admin" };

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-2 text-2xl font-bold text-slate-900">
        Hi, {user.name} 
      </h2>
      <p className="mb-8 text-sm text-slate-500">
        Welcome to the admin panel. Manage your KitabGhar platform.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/users"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="mb-3 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
            <Users size={24} />
          </div>
          <h3 className="font-semibold text-slate-900 group-hover:text-[#1E3A5F]">
            User Management
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            View, create, edit, and delete users
          </p>
        </Link>

        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 opacity-50">
          <div className="mb-3 inline-flex rounded-xl bg-green-50 p-3 text-green-600">
            <BookOpen size={24} />
          </div>
          <h3 className="font-semibold text-slate-900">Book Management</h3>
          <p className="mt-1 text-sm text-slate-500">Coming soon</p>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 opacity-50">
          <div className="mb-3 inline-flex rounded-xl bg-purple-50 p-3 text-purple-600">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-semibold text-slate-900">Roles & Permissions</h3>
          <p className="mt-1 text-sm text-slate-500">Coming soon</p>
        </div>
      </div>
    </div>
  );
}