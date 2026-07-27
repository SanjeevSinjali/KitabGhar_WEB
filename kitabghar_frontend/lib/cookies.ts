"use server";

import { cookies } from "next/headers";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days — matches the JWT's expiresIn

const secureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth_token",
    value: token,
    ...secureCookieOptions,
  });
}

export async function getTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

export async function storeUserData(userData: unknown) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "user_data",
    value: JSON.stringify(userData),
    ...secureCookieOptions,
  });
}

export async function getUserData() {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("user_data")?.value;
  return userDataCookie ? JSON.parse(userDataCookie) : null;
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set({ name: "auth_token", value: "", path: "/", maxAge: 0 });
  cookieStore.set({ name: "user_data", value: "", path: "/", maxAge: 0 });
}