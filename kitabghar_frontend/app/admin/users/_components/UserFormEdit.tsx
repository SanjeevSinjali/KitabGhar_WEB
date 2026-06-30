"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { editUserSchema, type EditUserFormData } from "./schema";
import { handleUpdateUser } from "@/lib/actions/admin/user-action";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const errClass = "mt-1 text-xs text-red-500";

export default function UserFormEdit({ user }: { user: UserData }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      role: user.role as "user" | "admin" || "user",
    },
  });

  const onSubmit = (data: EditUserFormData) => {
    setError("");
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("name", data.name);
        fd.append("email", data.email);
        fd.append("role", data.role);

        const result = await handleUpdateUser(user._id, fd);
        if (!result.success) throw new Error(result.message);
        router.push("/admin/users");
        router.refresh();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setError(msg);
      }
    });
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className={labelClass}>Name</label>
          <input type="text" {...register("name")} className={inputClass} />
          {errors.name && <span className={errClass}>{errors.name.message}</span>}
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input type="email" {...register("email")} className={inputClass} />
          {errors.email && <span className={errClass}>{errors.email.message}</span>}
        </div>

        <div>
          <label className={labelClass}>Role</label>
          <select {...register("role")} className={inputClass}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <span className={errClass}>{errors.role.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-50"
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}