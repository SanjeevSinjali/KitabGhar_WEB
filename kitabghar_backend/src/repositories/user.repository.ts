import User, { IUser } from "../models/user.model";

export async function findUserByEmail(email: string): Promise<IUser | null> {
  return User.findOne({ email });
}

export async function createUser(name: string, email: string, hashedPassword: string): Promise<IUser> {
  const user = new User({ name, email, password: hashedPassword });
  return user.save();
}

export async function findUserById(id: string): Promise<IUser | null> {
  return User.findById(id).select("-password");
}