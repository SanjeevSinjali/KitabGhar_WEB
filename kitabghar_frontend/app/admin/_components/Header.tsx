/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useUser } from "@/context/UserContext";
import LogoutButton from "@/app/_components/logoutbutton";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  handleGetNotifications,
  handleMarkNotificationRead,
  handleMarkAllNotificationsRead,
} from "@/lib/actions/admin/notification-action";

type Notification = {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function Header() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "A";

  const loadNotifications = useCallback(async () => {
    const result = await handleGetNotifications({ limit: 10 });
    if (result.success) {
      setNotifications(result.notifications);
      setUnread(result.unread);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleOpenNotification(id: string) {
    await handleMarkNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnread((prev) => Math.max(0, prev - 1));
  }

  async function handleMarkAllRead() {
    await handleMarkAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-sm font-semibold text-slate-700">KitabGhar Admin</h1>
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-900 hover:bg-slate-100"
          >
            <Bell size={20} strokeWidth={2} stroke="black" fill="none" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-sm font-semibold text-slate-700">Notifications</span>
                {unread > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs font-medium text-sky-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleOpenNotification(n._id)}
                      className={`flex w-full flex-col gap-1 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                        n.read ? "opacity-60" : ""
                      }`}
                    >
                      <span className="text-sm text-slate-700">{n.message}</span>
                      <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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