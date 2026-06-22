import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../repositories/user.repository";
import type { RegisterDTO, LoginDTO } from "../dtos/user.dto";
import type { AuthResponse } from "../types/user.type";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
console.log(JWT_SECRET)

export async function registerService(data: RegisterDTO): Promise<AuthResponse> {
  const existing = await findUserByEmail(data.email);
  if (existing) throw new Error("Email already in use");

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await createUser(data.name, data.email, hashed);

  const userId = String(user._id);
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
  console.log(JWT_SECRET)


  return {
    token,
    user: { id: userId, name: user.name, email: user.email },
  };
}

export async function loginService(data: LoginDTO): Promise<AuthResponse> {
  const user = await findUserByEmail(data.email);
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const userId = String(user._id);
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

  return {
    token,
    user: { id: userId, name: user.name, email: user.email },
  };
}