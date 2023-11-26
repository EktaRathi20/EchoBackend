import mongoose from "mongoose";

export interface IToken {
    userId: mongoose.Schema.Types.ObjectId;
    token: string;
    createdAt: Date;
  }
  
  export const userTokenSchema = mongoose.model(
    "UserToken",
    new mongoose.Schema<IToken>({
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      token: { type: String, required: true },
      createdAt: { type: Date, default: Date.now, expires: 30 * 86400 }, // 30 days
    })
  );