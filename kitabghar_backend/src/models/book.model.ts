import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  price: number;
  condition: "Like New" | "Good" | "Fair";
  description?: string;
  image: string;
  seller: mongoose.Types.ObjectId;
  status: "Active" | "Sold";
  source: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    condition: { type: String, enum: ["Like New", "Good", "Fair"], default: "Good" },
    description: { type: String, trim: true, default: "" },
    image: { type: String, required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Active", "Sold"], default: "Active" },
    source: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.model<IBook>("Book", BookSchema);