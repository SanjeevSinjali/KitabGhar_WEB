"use server";

import { cookies } from "next/headers";
import { ENDPOINTS } from "@/lib/api/endpoints";

const TOKEN_KEY = "kitabghar_token";
const USER_KEY = "kitabghar_user";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  try {
    const res = await fetch(ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json() as { message?: string };
      return { success: false, message: error.message || "Login failed" };
    }
    const data = await res.json() as { token: string; user: { id: string; name: string; email: string } };
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_KEY, data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    cookieStore.set(USER_KEY, JSON.stringify(data.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return { success: true, user: data.user };
  } catch {
    return { success: false, message: "Something went wrong." };
  }
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  try {
    const res = await fetch(ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const error = await res.json() as { message?: string };
      return { success: false, message: error.message || "Registration failed" };
    }
    const data = await res.json() as { token: string; user: { id: string; name: string; email: string } };
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_KEY, data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    cookieStore.set(USER_KEY, JSON.stringify(data.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return { success: true, user: data.user };
  } catch {
    return { success: false, message: "Something went wrong." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_KEY);
  cookieStore.delete(USER_KEY);
  return { success: true };
}