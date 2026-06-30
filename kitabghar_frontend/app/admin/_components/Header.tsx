"use client";
import { useUser } from "@/context/UserContext";
import LogoutButton from "@/app/_components/logoutbutton";

export default function Header() {
  const { user } = useUser();
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "A";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-sm font-semibold text-slate-700">KitabGhar Admin</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E3A5F] text-xs font-semibold text-white">
            {initials}
          </div>
          <span className="text-sm text-slate-600">{user?.name || "Admin"}</span>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}