import axiosInstance from "./axios-instance";
import { ENDPOINTS } from "./endpoints";

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; }
export interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string; };
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const res = await axiosInstance.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, payload);
  return res.data;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await axiosInstance.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, payload);
  return res.data;
}