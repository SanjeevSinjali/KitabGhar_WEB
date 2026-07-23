import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  pidx: string;
  buyer: mongoose.Types.ObjectId;
  bookId: string;
  title: string;
  author: string;
  price: string;
  image: string;
  condition: string;
  amount: number; // paisa
  purchaseOrderId: string;
  transactionId?: string;
  status: "Initiated" | "Pending" | "Completed" | "Expired" | "User canceled" | "Refunded";
}

const PaymentSchema = new Schema<IPayment>(
  {
    pidx: { type: String, required: true, unique: true },
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
    condition: { type: String, required: true },
    amount: { type: Number, required: true },
    purchaseOrderId: { type: String, required: true, unique: true },
    transactionId: { type: String },
    status: {
      type: String,
      enum: ["Initiated", "Pending", "Completed", "Expired", "User canceled", "Refunded"],
      default: "Initiated",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);