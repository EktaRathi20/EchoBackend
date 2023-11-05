import mongoose from "mongoose";

export interface IUser {
  firstName: string;
  lastName: string;
  ageGroup: string;
  gender: string;
  username: string;
  email: string;
  password: string;
  otp:string;
}

export interface IUserDb extends IUser {
  id: mongoose.Schema.Types.ObjectId
}

export const userSchema = mongoose.model(
  "users",
  new mongoose.Schema<IUser>({
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    ageGroup: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp:{
      type:String,
      required:false
    },
  })
);

export interface IToken {
  userId: mongoose.Schema.Types.ObjectId,
  token: string,
  createdAt: Date
}

export const userTokenSchema = mongoose.model("UserToken", new mongoose.Schema<IToken>({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 30 * 86400 }, // 30 days
}));

  