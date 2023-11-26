import mongoose from "mongoose";

export interface IUser {
  firstName: string;
  lastName: string;
  ageGroup: string;
  gender: string;
  username: string;
  email: string;
  password: string;
  otp: string;
  profileImage: string;
  followers?: mongoose.Schema.Types.ObjectId[]; // Reference to followers
  following?: mongoose.Schema.Types.ObjectId[]; // Reference to following
}

export interface IUserDb extends IUser {
  id: mongoose.Schema.Types.ObjectId;
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
    otp: {
      type: String,
      required: false,
    },
    profileImage: {
      type: String,
      required: false,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  })
);
