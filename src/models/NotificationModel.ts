// notificationModel.ts
import mongoose from "mongoose";

export interface INotification {
  type: "like" | "comment" | "follow";
  userId:mongoose.Types.ObjectId,   
  postId?: string;
  commentId?: string;
  followerId?: string;
  createdAt: Date;
}

export const notificationSchema = mongoose.model<INotification>(
  "Notification",
  new mongoose.Schema<INotification>({
    type: { type: String, required: true },
    userId:{type:mongoose.Schema.Types.ObjectId, ref:"users"},
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    followerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  })
);
