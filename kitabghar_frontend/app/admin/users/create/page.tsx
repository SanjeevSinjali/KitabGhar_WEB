import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import UserForm from "../_components/UserForm";

export default function CreateUserPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600"
      >
        <ArrowLeft size={14} />
        Back to users
      </Link>
      <h2 className="mb-6 mt-3 text-2xl font-bold text-slate-900">New User</h2>
      <UserForm />
    </div>
  );
}