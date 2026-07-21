import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  type: string;
  message: string;
  user: mongoose.Types.ObjectId;
  recipient?: mongoose.Types.ObjectId;
  changedFields: string[];
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: { type: String, required: true, default: "profile_update" },
    message: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User" },
    changedFields: { type: [String], default: [] },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("Notification", NotificationSchema);