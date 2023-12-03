import { ObjectId } from "mongodb";
import { notificationSchema } from "../models/NotificationModel";
import {  postSchema } from "../models/PostModel";
import { userSchema } from "../models/UserModel";

export const likeNotification = async (userId: string, postId: string) => {
    const notification = await notificationSchema.create({
        type: "like",
        postId: postId,
        userId: userId,
        createdAt: new Date(),
    });

    const getUserId = await postSchema.findById(postId);
    const postUserId = getUserId?.userId;

    await userSchema.findByIdAndUpdate(postUserId, {
        $push: { notifications: notification._id },
    });
};

export const commentNotification = async (userId: string, postId: string, commentId: ObjectId) => {

    const notification = await notificationSchema.create({
        type: "comment",
        postId: postId,
        userId: userId,
        commentId: commentId,
    });

    const getUserId = await postSchema.findById(postId);
    const postUserId = getUserId?.userId;

    await userSchema.findByIdAndUpdate(postUserId, {
        $push: { notifications: notification._id },
    });
};

export const followNotification = async (userId: string, followId: string) =>{
    const notification = await notificationSchema.create({
        type: "follow",
        userId: userId,
        followerId: followId,
    });

    await userSchema.findByIdAndUpdate(userId, {
        $push: { notifications: notification._id },
    });
}