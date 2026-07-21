"use client";

import { useUser } from "@/context/UserContext";
import {
  updateProfileAction,
  requestPasswordChangeAction,
  confirmPasswordChangeAction,
} from "@/lib/actions/auth-action";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileInfoSchema,
  requestCodeSchema,
  confirmCodeSchema,
  type ProfileInfoFormData,
  type RequestCodeFormData,
  type ConfirmCodeFormData,
} from "./_components/schema";
import {
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User as UserIcon,
  ShieldCheck,
  MailCheck,
} from "lucide-react";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const errClass = "mt-1 text-xs text-red-500";

function Banner({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={`mb-5 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
        type === "success"
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-600"
      }`}
    >
      {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] = useState<string | null>(user?.avatar ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [infoSuccess, setInfoSuccess] = useState("");
  const [infoError, setInfoError] = useState("");
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  const [pwStep, setPwStep] = useState<"form" | "code">("form");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingNewPassword, setPendingNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register: registerInfo,
    handleSubmit: handleInfoSubmit,
    formState: { errors: infoErrors },
  } = useForm<ProfileInfoFormData>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });

  const {
    register: registerRequest,
    handleSubmit: handleRequestSubmit,
    reset: resetRequestForm,
    formState: { errors: requestErrors },
  } = useForm<RequestCodeFormData>({
    resolver: zodResolver(requestCodeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const {
    register: registerConfirm,
    handleSubmit: handleConfirmSubmit,
    reset: resetConfirmForm,
    formState: { errors: confirmErrors },
  } = useForm<ConfirmCodeFormData>({
    resolver: zodResolver(confirmCodeSchema),
    defaultValues: { code: "" },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  const onSubmitInfo = async (data: ProfileInfoFormData) => {
    setInfoError("");
    setInfoSuccess("");
    setIsSavingInfo(true);
    try {
      const fd = new FormData();
      fd.append("name", data.name);
      fd.append("email", data.email);
      if (file) fd.append("avatar", file);

      const updated = await updateProfileAction(fd);
      setUser(updated);
      setInfoSuccess("Profile updated successfully!");
      router.refresh();
    } catch {
      setInfoError("Failed to update profile.");
    } finally {
      setIsSavingInfo(false);
    }
  };

  const onRequestCode = async (data: RequestCodeFormData) => {
    setPwError("");
    setPwSuccess("");
    setIsSendingCode(true);
    const result = await requestPasswordChangeAction(data.currentPassword);
    setIsSendingCode(false);
    if (!result.success) {
      setPwError(result.message || "Failed to send verification code");
      return;
    }
    setPendingNewPassword(data.newPassword);
    setPwSuccess(result.message || "Code sent to your email");
    setPwStep("code");
  };

  const onConfirmCode = async (data: ConfirmCodeFormData) => {
    setPwError("");
    setIsConfirming(true);
    const result = await confirmPasswordChangeAction({
      code: data.code,
      newPassword: pendingNewPassword,
    });
    setIsConfirming(false);
    if (!result.success) {
      setPwError(result.message || "Failed to confirm password change");
      return;
    }
    setPwSuccess("Password changed successfully!");
    setPwStep("form");
    setPendingNewPassword("");
    resetRequestForm();
    resetConfirmForm();
  };

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your profile information and password.
          </p>
        </div>

        {/* Profile Information Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <UserIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Profile Information</h2>
              <p className="text-xs text-slate-500">Update your photo, name, and email</p>
            </div>
          </div>

          {infoSuccess && <Banner type="success" message={infoSuccess} />}
          {infoError && <Banner type="error" message={infoError} />}

          <form onSubmit={handleInfoSubmit(onSubmitInfo)} className="space-y-5">
            <div className="flex items-center gap-5">
              <div
                onClick={() => fileRef.current?.click()}
                className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-100"
              >
                {preview ? (
                  <img src={preview} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-400">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <Camera size={18} className="text-white" />
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Change photo
                </button>
                <p className="mt-1.5 text-xs text-slate-400">JPG, PNG or WEBP. Max 2MB.</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <label className={labelClass}>Full Name</label>
              <input {...registerInfo("name")} type="text" className={inputClass} />
              {infoErrors.name && <span className={errClass}>{infoErrors.name.message}</span>}
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <input {...registerInfo("email")} type="email" className={inputClass} />
              {infoErrors.email && <span className={errClass}>{infoErrors.email.message}</span>}
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={isSavingInfo}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-6 text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-50"
              >
                {isSavingInfo && <Loader2 size={16} className="animate-spin" />}
                {isSavingInfo ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Change Password</h2>
              <p className="text-xs text-slate-500">
                {pwStep === "form"
                  ? "We'll email you a code to confirm this change"
                  : "Enter the 6-digit code sent to your email"}
              </p>
            </div>
          </div>

          {pwSuccess && <Banner type="success" message={pwSuccess} />}
          {pwError && <Banner type="error" message={pwError} />}

          {pwStep === "form" ? (
            <form
              onSubmit={handleRequestSubmit(onRequestCode)}
              autoComplete="off"
              className="space-y-5"
            >
              <div>
                <label className={labelClass}>Current Password</label>
                <div className="relative">
                  <input
                    {...registerRequest("currentPassword")}
                    type={showCurrent ? "text" : "password"}
                    autoComplete="new-password"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {requestErrors.currentPassword && (
                  <span className={errClass}>{requestErrors.currentPassword.message}</span>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>New Password</label>
                  <div className="relative">
                    <input
                      {...registerRequest("newPassword")}
                      type={showNew ? "text" : "password"}
                      autoComplete="new-password"
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {requestErrors.newPassword && (
                    <span className={errClass}>{requestErrors.newPassword.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <div className="relative">
                    <input
                      {...registerRequest("confirmPassword")}
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {requestErrors.confirmPassword && (
                    <span className={errClass}>{requestErrors.confirmPassword.message}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={isSendingCode}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-6 text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-50"
                >
                  {isSendingCode && <Loader2 size={16} className="animate-spin" />}
                  <MailCheck size={16} />
                  {isSendingCode ? "Sending code..." : "Send Verification Code"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConfirmSubmit(onConfirmCode)} className="space-y-5">
              <div>
                <label className={labelClass}>6-Digit Code</label>
                <input
                  {...registerConfirm("code")}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className={`${inputClass} text-center text-lg tracking-[0.5em]`}
                />
                {confirmErrors.code && (
                  <span className={errClass}>{confirmErrors.code.message}</span>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setPwStep("form");
                    setPwError("");
                    setPwSuccess("");
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isConfirming}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-6 text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-50"
                >
                  {isConfirming && <Loader2 size={16} className="animate-spin" />}
                  {isConfirming ? "Confirming..." : "Confirm Change"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}