import mongoose from "mongoose";
export interface IComment {
  userId: string;
  text: string;
}
export const commentSchema = mongoose.model(
  "Comment",
  new mongoose.Schema<IComment>({
    userId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  })
);

export interface IPost {
  userId: string;
  content: string;
  type: "text" | "audio";
  audioFilePath:string
  likes: string[];
  comments: mongoose.Types.ObjectId[];
  createdAt: Date;
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
      required: false,
    },
    type: {
      type: String,
      enum: ["text", "audio"],
      required: true,
    },
    audioFilePath:{
      type:String,
      required:false
    },
    likes: [
      {
        type: String,
      },
    ],
    comments: [
      {
        type: mongoose.Types.ObjectId,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  })
);
