import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { handleGetUserById } from "@/lib/actions/admin/user-action";
import UserFormEdit from "../../_components/UserFormEdit";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await handleGetUserById(id);

  if (!result.success || !result.data) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600"
      >
        <ArrowLeft size={14} />
        Back to users
      </Link>
      <h2 className="mb-6 mt-3 text-2xl font-bold text-slate-900">Edit User</h2>
      <UserFormEdit user={result.data} />
    </div>
  );
}