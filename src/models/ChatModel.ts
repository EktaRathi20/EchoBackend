import mongoose from "mongoose";

export interface IChatRoom {
  senderId: mongoose.Schema.Types.ObjectId;
  receiverId: mongoose.Schema.Types.ObjectId;
}

export interface IChat {
  roomId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  message: string;
  createdAt: Date;
}

export const chatRoomSchema = mongoose.model(
  "chatRoom",
  new mongoose.Schema<IChatRoom>({
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  })
);

export const chatSchema = mongoose.model(
  "chat",
  new mongoose.Schema<IChat>({
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  })
);
