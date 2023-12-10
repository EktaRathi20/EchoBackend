import mongoose from "mongoose";

export const FamilyRoom = mongoose.model(
  "FamilyRoom",
  new mongoose.Schema({
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    accessKey: {
      type: String,
      required: true,
      unique: true,
    },
    familyName:{
        type:String,
        require:true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post", // Reference to the Post model
      },
    ],
  })
);
