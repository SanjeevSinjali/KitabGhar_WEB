"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { registerSchema } from "./schema";
import { registerAction } from "@/lib/actions/auth-action";
import GoogleAuthButton from "./GoogleAuthButton";

const perks = [
  "List your books in under 2 minutes",
  "Reach thousands of local readers",
  "Secure payments & buyer protection",
];

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = registerSchema.safeParse(data);
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
    const result = await registerAction(formData);
    setLoading(false);

    if (result.success) {
      form.reset();
      router.push("/login");
    } else {
      setError(result.message || "Registration failed");
    }
  }

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl border border-white/60 bg-white">
      <div className="grid md:grid-cols-[1fr_1.1fr]">

        <section className="relative hidden md:flex flex-col justify-between overflow-hidden bg-[#1E3A5F] p-10 text-white">
          <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#10B981]/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <Image src="/kitabghar_logo.png" alt="KitabGhar" width={48} height={48} className="rounded-2xl bg-white/90 p-1 object-contain shadow" />
              <span className="text-lg font-semibold tracking-wide">KitabGhar</span>
            </div>
            <h2 className="mt-10 text-3xl font-bold leading-tight">Give your books<br />a second story.</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">Join thousands of readers who buy and sell pre-loved books every day.</p>
            <ul className="mt-8 space-y-4">
              {perks.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-white/80">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#10B981]" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative z-10 text-xs text-white/40">© {new Date().getFullYear()} KitabGhar. All rights reserved.</p>
        </section>

        <section className="px-8 py-10 sm:px-12">
          <div className="mb-6 flex items-center gap-2 md:hidden">
            <Image src="/kitabghar_logo.png" alt="KitabGhar" width={40} height={40} className="rounded-xl bg-[#1E3A5F]/10 p-1 object-contain" />
            <span className="font-semibold text-slate-800">KitabGhar</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Already have one?{" "}
            <Link href="/login" className="font-medium text-[#10B981] hover:underline">Sign in</Link>
          </p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div className="mt-6">
            <GoogleAuthButton onError={setError} />
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="name" type="text" placeholder="Example Bahadur" className={`w-full rounded-xl border bg-[#FDFBF7] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${fieldErrors.name ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-[#E7E0D8] focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/10"}`} />
              </div>
              {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="email" type="email" placeholder="you@example.com" className={`w-full rounded-xl border bg-[#FDFBF7] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${fieldErrors.email ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-[#E7E0D8] focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/10"}`} />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="password" type={showPassword ? "text" : "password"} placeholder="Create a password" className={`w-full rounded-xl border bg-[#FDFBF7] py-3 pl-10 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${fieldErrors.password ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-[#E7E0D8] focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/10"}`} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Re-enter your password" className={`w-full rounded-xl border bg-[#FDFBF7] py-3 pl-10 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${fieldErrors.confirmPassword ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-[#E7E0D8] focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/10"}`} />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
            </div>

            <label className="flex cursor-pointer items-start gap-2.5">
              <input type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#1E3A5F] rounded" />
              <span className="text-xs text-slate-500">
                I agree to the{" "}
                <Link href="/terms" className="font-medium text-[#1E3A5F] hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="font-medium text-[#1E3A5F] hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] py-3 text-sm font-semibold text-white transition hover:bg-[#162d4a] active:scale-[0.98] disabled:opacity-60">
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}