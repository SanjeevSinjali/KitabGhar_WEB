"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createUserSchema, type CreateUserFormData } from "./schema";
import { handleCreateUser } from "@/lib/actions/admin/user-action";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const errClass = "mt-1 text-xs text-red-500";

export default function UserForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "user" },
  });

  const onSubmit = (data: CreateUserFormData) => {
    setError("");
    startTransition(async () => {
      try {
        const result = await handleCreateUser(data);
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
          <input
            type="text"
            {...register("name")}
            placeholder="Full name"
            className={inputClass}
          />
          {errors.name && <span className={errClass}>{errors.name.message}</span>}
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            {...register("email")}
            placeholder="user@example.com"
            className={inputClass}
          />
          {errors.email && <span className={errClass}>{errors.email.message}</span>}
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            {...register("password")}
            placeholder="••••••••"
            className={inputClass}
          />
          {errors.password && (
            <span className={errClass}>{errors.password.message}</span>
          )}
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
          {isPending ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}