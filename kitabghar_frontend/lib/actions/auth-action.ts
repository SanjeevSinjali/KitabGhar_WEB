"use server";

import { setTokenCookie, storeUserData, clearAuthCookies } from "@/lib/cookies";
import { ENDPOINTS } from "@/lib/api/endpoints";

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
    await setTokenCookie(data.token);
    await storeUserData(data.user);
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
    await setTokenCookie(data.token);
    await storeUserData(data.user);
    return { success: true, user: data.user };
  } catch {
    return { success: false, message: "Something went wrong." };
  }
}

export async function logoutAction() {
  await clearAuthCookies();
  return { success: true };
}