import Cookies from "js-cookie";

const TOKEN_KEY = "kitabghar_token";

export function setToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: "strict" });
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}