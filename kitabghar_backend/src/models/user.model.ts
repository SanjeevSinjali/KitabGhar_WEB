import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar: string | null;
  role: "user" | "admin";
  provider: "local" | "google";
  googleId?: string;
  passwordChangeCode?: string;
  passwordChangeCodeExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6 }, // optional now — Google accounts have no password
    avatar: { type: String, default: null },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String, unique: true, sparse: true },
    passwordChangeCode: { type: String, select: false },
    passwordChangeCodeExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);