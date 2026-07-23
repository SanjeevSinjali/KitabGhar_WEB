/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { handleVerifyKhaltiPayment } from "@/lib/actions/purchase-action";

function KhaltiCallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirming your payment...");

  useEffect(() => {
    const pidx = params.get("pidx");
    const khaltiStatus = params.get("status");

    if (!pidx) {
      setStatus("error");
      setMessage("Missing payment reference.");
      return;
    }

    if (khaltiStatus === "User canceled") {
      setStatus("error");
      setMessage("Payment was canceled.");
      return;
    }

    handleVerifyKhaltiPayment(pidx).then((result) => {
      if (result.success) {
        setStatus("success");
        setMessage("Payment confirmed! Redirecting to your purchases...");
        setTimeout(() => router.replace("/purchases"), 1800);
      } else {
        setStatus("error");
        setMessage(result.message || "Payment verification failed.");
      }
    });
  }, [params, router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            status === "success"
              ? "bg-green-50 text-green-500"
              : status === "error"
              ? "bg-red-50 text-red-500"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {status === "success" && <CheckCircle2 size={28} />}
          {status === "error" && <AlertCircle size={28} />}
          {status === "loading" && <Loader2 size={28} className="animate-spin" />}
        </div>
        <h1 className="text-base font-semibold text-slate-900">
          {status === "success" ? "Payment successful" : status === "error" ? "Payment issue" : "Please wait"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}

export default function KhaltiCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center p-4">Loading...</div>}>
      <KhaltiCallbackContent />
    </Suspense>
  );
}