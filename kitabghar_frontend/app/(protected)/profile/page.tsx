"use client";

import { useUser } from "@/context/UserContext";
import { updateProfileAction } from "@/lib/actions/auth-action";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [preview, setPreview] = useState<string | null>(user?.avatar ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      if (file) fd.append("avatar", file);

      const updated = await updateProfileAction(fd);
      setUser(updated);
      setSuccess("Profile updated successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Failed to update profile.");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Update Profile</h1>

      {success && <p className="text-green-600 mb-4">{success}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          onClick={() => fileRef.current?.click()}
          className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 cursor-pointer border-2 border-dashed border-gray-400 flex items-center justify-center mx-auto"
        >
          {preview ? (
            <img src={preview} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500 text-sm text-center">Click to upload</span>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}