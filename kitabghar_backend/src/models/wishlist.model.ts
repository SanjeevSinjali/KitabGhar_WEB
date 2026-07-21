import mongoose, { Schema, Document } from "mongoose";

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  bookId: string;
  title: string;
  author: string;
  price: string;
  image: string;
  condition: string;
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
    condition: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

WishlistSchema.index({ user: 1, bookId: 1 }, { unique: true });

export default mongoose.model<IWishlist>("Wishlist", WishlistSchema);