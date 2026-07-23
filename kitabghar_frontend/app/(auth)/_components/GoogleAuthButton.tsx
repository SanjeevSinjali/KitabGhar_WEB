"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { googleAuthAction } from "@/lib/actions/auth-action";

export default function GoogleAuthButton({ onError }: { onError: (msg: string) => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      onError("Google sign-in failed. Please try again.");
      return;
    }
    setLoading(true);
    const result = await googleAuthAction(credentialResponse.credential);
    setLoading(false);

    if (result.success) {
      router.push(result.redirectTo || "/dashboard");
    } else {
      onError(result.message || "Google sign-in failed.");
    }
  }

  return (
    <div className={loading ? "pointer-events-none opacity-60" : ""}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError("Google sign-in failed. Please try again.")}
        width="100%"
        text="continue_with"
        shape="pill"
      />
    </div>
  );
}