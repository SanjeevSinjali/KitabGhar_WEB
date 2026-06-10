"use client";

import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth-action";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
    >
      Logout
    </button>
  );
}