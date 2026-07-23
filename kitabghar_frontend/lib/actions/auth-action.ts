"use server";
import { setTokenCookie, storeUserData, clearAuthCookies, getTokenCookie } from "@/lib/cookies";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  try {
    const res = await fetch(`http://localhost:5000${ENDPOINTS.AUTH.LOGIN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json() as { message?: string };
      return { success: false, message: error.message || "Login failed" };
    }
    const data = await res.json() as {
      token: string;
      user: { id: string; name: string; email: string; role: string };
    };
    await setTokenCookie(data.token);
    await storeUserData(data.user);

    const redirectTo = data.user.role === "admin" ? "/admin" : "/dashboard";
    return { success: true, user: data.user, redirectTo };
  } catch {
    return { success: false, message: "Something went wrong." };
  }
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  try {
    const res = await fetch(`http://localhost:5000${ENDPOINTS.AUTH.REGISTER}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const error = await res.json() as { message?: string };
      return { success: false, message: error.message || "Registration failed" };
    }
    const data = await res.json() as {
      token: string;
      user: { id: string; name: string; email: string; role: string };
    };
    await setTokenCookie(data.token);
    await storeUserData(data.user);

    const redirectTo = data.user.role === "admin" ? "/admin" : "/dashboard";
    return { success: true, user: data.user, redirectTo };
  } catch {
    return { success: false, message: "Something went wrong." };
  }
}

export async function logoutAction() {
  await clearAuthCookies();
  return { success: true };
}

export async function whoamiAction() {
  const token = await getTokenCookie();
  if (!token) return null;

  const res = await fetch(`http://localhost:5000${ENDPOINTS.AUTH.WHOAMI}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json() as {
    success: boolean;
    data: { _id: string; name: string; email: string; role: string; avatar?: string };
  };
  return data.data;
}

export async function updateProfileAction(formData: FormData) {
  const token = await getTokenCookie();
  const res = await fetch(`http://localhost:5000${ENDPOINTS.AUTH.UPDATE}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Update failed");
  const data = await res.json() as {
    success: boolean;
    data: { _id: string; name: string; email: string; role: string; avatar?: string };
  };

  await storeUserData({
    id: data.data._id,
    name: data.data.name,
    email: data.data.email,
    role: data.data.role,
    avatar: data.data.avatar,
  });

  return data.data;
}

export async function requestPasswordChangeAction(currentPassword: string) {
  const token = await getTokenCookie();
  try {
    const res = await fetch(`http://localhost:5000${ENDPOINTS.AUTH.REQUEST_PASSWORD_CHANGE}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword }),
    });
    const result = await res.json() as { success?: boolean; message?: string };
    if (!res.ok) {
      return { success: false, message: result.message || "Failed to send verification code" };
    }
    return { success: true, message: result.message || "Code sent" };
  } catch {
    return { success: false, message: "Something went wrong." };
  }
}

export async function confirmPasswordChangeAction(data: { code: string; newPassword: string }) {
  const token = await getTokenCookie();
  try {
    const res = await fetch(`http://localhost:5000${ENDPOINTS.AUTH.CONFIRM_PASSWORD_CHANGE}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await res.json() as { success?: boolean; message?: string };
    if (!res.ok) {
      return { success: false, message: result.message || "Failed to update password" };
    }
    return { success: true, message: result.message || "Password updated successfully" };
  } catch {
    return { success: false, message: "Something went wrong." };
  }
}

export async function forgotPasswordAction(email: string) {
  try {
    const res = await fetch(`http://localhost:5000${ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await res.json() as { success?: boolean; message?: string };
    if (!res.ok) {
      return { success: false, message: result.message || "Something went wrong." };
    }
    return { success: true, message: result.message || "Code sent" };
  } catch {
    return { success: false, message: "Something went wrong." };
  }
}

export async function resetPasswordAction(data: { email: string; code: string; newPassword: string }) {
  try {
    const res = await fetch(`http://localhost:5000${ENDPOINTS.AUTH.RESET_PASSWORD}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json() as { success?: boolean; message?: string };
    if (!res.ok) {
      return { success: false, message: result.message || "Failed to reset password" };
    }
    return { success: true, message: result.message || "Password reset successfully" };
  } catch {
    return { success: false, message: "Something went wrong." };
  }
}