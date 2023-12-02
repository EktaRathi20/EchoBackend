import mongoose from "mongoose";

export interface Comment {
  userId: string;
  text: string;
}

export interface IPost {
  userId: string;
  content: string;
  type: "text" | "audio";
  likes: string[];
  comments: Comment[];
}

export const postSchema = mongoose.model(
  "Posts",
  new mongoose.Schema<IPost>({
    userId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "audio"],
      required: true,
    },
    likes: [
      {
        type: String,
      },
    ],
    comments: [
      {
        userId: String,
        text: String,
      },
    ],
  })
);
