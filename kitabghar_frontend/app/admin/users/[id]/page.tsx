import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { handleGetUserById } from "@/lib/actions/admin/user-action";
import { notFound } from "next/navigation";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await handleGetUserById(id);

  if (!result.success || !result.data) notFound();

  const user = result.data;

  const rows: [string, string][] = [
    ["Name", user.name],
    ["Email", user.email],
    ["Role", user.role || "user"],
    ["Created", user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"],
    ["Updated", user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "—"],
  ];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600"
      >
        <ArrowLeft size={14} />
        Back to users
      </Link>

      <div className="mt-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1E3A5F] text-lg font-bold text-white">
            {user.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase() || "?"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <Link
          href={`/admin/users/${user._id}/edit`}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <Pencil size={14} />
          Edit
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between border-b border-slate-100 px-5 py-3.5 last:border-0"
          >
            <span className="text-sm text-slate-500">{label}</span>
            <span className="text-sm font-medium text-slate-900">
              {value || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}