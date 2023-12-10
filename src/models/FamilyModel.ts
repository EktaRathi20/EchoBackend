import mongoose from "mongoose";
export interface IFamilyRoom {
  creatorId:mongoose.Schema.Types.ObjectId,
  accessKey:String,
  familyName:String,
  members:mongoose.Types.ObjectId[],
  posts:mongoose.Types.ObjectId[]
}
export interface IFamilyRoomDb extends IFamilyRoom{
  id: mongoose.Schema.Types.ObjectId;
}
export const familyRoomSchema = mongoose.model(
  "familySchema",
  new mongoose.Schema<IFamilyRoom>({
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
        type: mongoose.Types.ObjectId,
        ref: "User", // Reference to the User model
      },
    ],
    posts: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Post", // Reference to the Post model
      },
    ],
  })
);
