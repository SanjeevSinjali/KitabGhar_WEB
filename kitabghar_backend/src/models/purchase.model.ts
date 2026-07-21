import mongoose, { Schema, Document } from "mongoose";

export interface IPurchase extends Document {
  buyer: mongoose.Types.ObjectId;
  bookId: string;
  title: string;
  author: string;
  price: string;
  image: string;
  condition: string;
  createdAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
    condition: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IPurchase>("Purchase", PurchaseSchema);