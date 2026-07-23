"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { loginSchema } from "./schema";
import { loginAction } from "@/lib/actions/auth-action";
import GoogleAuthButton from "./GoogleAuthButton";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key) errors[String(key)] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const result = await loginAction(formData);
    setLoading(false);

    if (result.success) {
      router.push(result.redirectTo || "/dashboard");
    } else {
      setError(result.message || "Login failed");
    }
  }

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-[#E7E0D8] bg-white shadow-xl">
      <div className="grid md:grid-cols-2">

        <section className="hidden md:flex flex-col justify-between bg-[#1E3A5F] p-10 text-white">
          <div>
            <Image src="/kitabghar_logo.png" alt="KitabGhar logo" width={60} height={60} className="rounded-2xl bg-white p-1 object-contain shadow-sm" />
            <h2 className="mt-6 text-3xl font-bold leading-tight">Welcome back to KitabGhar</h2>
            <p className="mt-4 text-white/80">Sign in to continue buying and selling unwanted books.</p>
          </div>
          <p className="text-sm text-white/70">Books deserve a second life.</p>
        </section>

        <section className="p-8 sm:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 md:hidden">
              <Image src="/kitabghar_logo.png" alt="KitabGhar logo" width={52} height={52} className="rounded-2xl bg-[#ADD8E6] p-1 object-contain shadow-sm" />
              <h1 className="mt-4 text-2xl font-bold text-slate-900">Login</h1>
              <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
            </div>
            <div className="mb-8 hidden md:block">
              <h1 className="text-3xl font-bold text-slate-900">Login</h1>
              <p className="mt-2 text-sm text-slate-500">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}

            <div className="mb-5">
              <GoogleAuthButton onError={setError} />
            </div>

            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    placeholder="example@gmail.com"
                    className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${fieldErrors.email ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-[#E7E0D8] focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/10"}`}
                  />
                </div>
                {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <Link href="/forgot-password" className="text-xs font-medium text-[#10B981] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`w-full rounded-xl border bg-white py-3 pl-10 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${fieldErrors.password ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-[#E7E0D8] focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/10"}`}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-xl bg-black py-3 font-medium text-white transition hover:bg-[#1E3A5F] disabled:opacity-60">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-[#10B981] hover:underline">Register</Link>
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}