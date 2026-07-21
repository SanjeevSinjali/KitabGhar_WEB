import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: string | null;
  role: "user" | "admin";
  passwordChangeCode?: string;
  passwordChangeCodeExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: null },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    passwordChangeCode: { type: String, select: false },
    passwordChangeCodeExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);