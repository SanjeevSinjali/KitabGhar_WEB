"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, KeyRound, Lock, ArrowLeft } from "lucide-react";
import { forgotPasswordSchema, resetPasswordSchema } from "./schema";
import { forgotPasswordAction, resetPasswordAction } from "@/lib/actions/auth-action";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleRequestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data = { email: formData.get("email") as string };

    const parsed = forgotPasswordSchema.safeParse(data);
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
    const result = await forgotPasswordAction(parsed.data.email);
    setLoading(false);

    if (result.success) {
      setEmail(parsed.data.email);
      setCode("");
      setInfo(result.message || "If that email exists, a code has been sent.");
      setStep("reset");
    } else {
      setError(result.message || "Something went wrong");
    }
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      code,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = resetPasswordSchema.safeParse(data);
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
    const result = await resetPasswordAction({
      email,
      code: parsed.data.code,
      newPassword: parsed.data.newPassword,
    });
    setLoading(false);

    if (result.success) {
      router.push("/login");
    } else {
      setError(result.message || "Failed to reset password");
    }
  }

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-[#E7E0D8] bg-white shadow-xl">
      <div className="grid md:grid-cols-2">

        <section className="hidden md:flex flex-col justify-between bg-[#1E3A5F] p-10 text-white">
          <div>
            <Image src="/kitabghar_logo.png" alt="KitabGhar logo" width={60} height={60} className="rounded-2xl bg-white p-1 object-contain shadow-sm" />
            <h2 className="mt-6 text-3xl font-bold leading-tight">Reset your password</h2>
            <p className="mt-4 text-white/80">We&apos;ll email you a 6-digit code to get you back into your account.</p>
          </div>
          <p className="text-sm text-white/70">Books deserve a second life.</p>
        </section>

        <section className="p-8 sm:p-10">
          <div className="mx-auto max-w-md">
            <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700">
              <ArrowLeft size={14} /> Back to login
            </Link>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {step === "request" ? "Forgot password" : "Enter code"}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {step === "request"
                  ? "Enter your email and we'll send you a reset code."
                  : `We sent a code to ${email}. Enter it below with your new password.`}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}
            {info && step === "reset" && (
              <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-100">
                {info}
              </div>
            )}

            {step === "request" ? (
              <form className="space-y-5" onSubmit={handleRequestCode}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="example@gmail.com"
                      className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${fieldErrors.email ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-[#E7E0D8] focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/10"}`}
                    />
                  </div>
                  {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                </div>

                <button type="submit" disabled={loading} className="w-full rounded-xl bg-black py-3 font-medium text-white transition hover:bg-[#1E3A5F] disabled:opacity-60">
                  {loading ? "Sending code..." : "Send reset code"}
                </button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleResetPassword}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">6-digit code</label>
                  <div className="relative">
                    <KeyRound size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      autoComplete="off"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm tracking-widest outline-none transition placeholder:text-slate-400 focus:ring-2 ${fieldErrors.code ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-[#E7E0D8] focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/10"}`}
                    />
                  </div>
                  {fieldErrors.code && <p className="mt-1 text-xs text-red-500">{fieldErrors.code}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      className={`w-full rounded-xl border bg-white py-3 pl-10 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${fieldErrors.newPassword ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-[#E7E0D8] focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/10"}`}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.newPassword && <p className="mt-1 text-xs text-red-500">{fieldErrors.newPassword}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Confirm new password</label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${fieldErrors.confirmPassword ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-[#E7E0D8] focus:border-[#1E3A5F] focus:ring-[#1E3A5F]/10"}`}
                    />
                  </div>
                  {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
                </div>

                <button type="submit" disabled={loading} className="w-full rounded-xl bg-black py-3 font-medium text-white transition hover:bg-[#1E3A5F] disabled:opacity-60">
                  {loading ? "Resetting..." : "Reset password"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="w-full text-center text-xs font-medium text-slate-400 hover:text-slate-600"
                >
                  Didn&apos;t get a code? Try again
                </button>
              </form>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}