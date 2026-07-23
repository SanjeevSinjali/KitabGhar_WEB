import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import {
  findUserByEmail,
  createUser,
  findUserByGoogleId,
  createGoogleUser,
} from "../repositories/user.repository";
import type { RegisterDTO, LoginDTO } from "../dtos/user.dto";
import type { AuthResponse } from "../types/user.type";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function registerService(data: RegisterDTO): Promise<AuthResponse> {
  const existing = await findUserByEmail(data.email);
  if (existing) throw new Error("Email already in use");

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await createUser(data.name, data.email, hashed);

  const userId = String(user._id);
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

  return {
    token,
    user: { id: userId, name: user.name, email: user.email, role: user.role },
  };
}

export async function loginService(data: LoginDTO): Promise<AuthResponse> {
  const user = await findUserByEmail(data.email);
  if (!user) throw new Error("Invalid email or password");

  if (!user.password) {
    throw new Error("This account uses Google sign-in. Please continue with Google instead.");
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const userId = String(user._id);
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

  return {
    token,
    user: { id: userId, name: user.name, email: user.email, role: user.role },
  };
}

export async function googleAuthService(idToken: string): Promise<AuthResponse> {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error("Invalid Google token");
  }

  const email = payload.email.toLowerCase();

  let user = await findUserByGoogleId(payload.sub);

  if (!user) {
    // Check if a local account already exists with this email — link it instead of creating a duplicate
    const existingLocal = await findUserByEmail(email);
    if (existingLocal) {
      existingLocal.googleId = payload.sub;
      if (!existingLocal.avatar && payload.picture) {
        existingLocal.avatar = payload.picture;
      }
      await existingLocal.save();
      user = existingLocal;
    } else {
      user = await createGoogleUser({
        name: payload.name || email.split("@")[0],
        email,
        googleId: payload.sub,
        avatar: payload.picture,
      });
    }
  }

  const userId = String(user._id);
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

  return {
    token,
    user: { id: userId, name: user.name, email: user.email, role: user.role },
  };
}