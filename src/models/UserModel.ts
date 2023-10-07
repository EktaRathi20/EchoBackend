import mongoose from "mongoose";

export interface IUser {
  firstName: string;
  lastName: string;
  ageGroup: string;
  gender: string;
  username: string;
  email: string;
  password: string;
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
  })
);
