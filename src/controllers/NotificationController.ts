import express from "express";
import { userSchema } from "../models/UserModel";
import { notificationSchema } from "../models/NotificationModel";
import { postSchema } from "../models/PostModel";

export class NotificationController {
  static async getNotifications(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;
      const user = await userSchema.findById(userId).populate("notifications");

      if (!user) {
        return response.status(404).json({ error: "User not found" });
      }

      const totalNotification: Record<string, any> = {
        like: [],
        comment: [],
        follow: [],
      };

      for (const notify of user.notifications) {
        const element = await notificationSchema.findById(notify);

        if (element) {
          const user = await userSchema.findById(element.userId);
          totalNotification[element.type].push({
            profileImage: user?.profileImage,
            username: user?.username,
            userId: element.userId,
            postId: element.postId,
            createdAt: element.createdAt,
          });
        }
      }

      response.status(200).json({ notification: totalNotification });
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  static async createNotification(
    userId: string,
    type: string,
    postId?: string,
    commentId?: string,
    followerId?: string
  ) {
    try {
      const notification = await notificationSchema.create({
        type,
        userId,
        postId,
        commentId,
        followerId,
        createdAt: new Date(),
      });

      const getUserId = await postSchema.findById(postId);
      const postUserId = getUserId?.userId;

      await userSchema.findByIdAndUpdate(postUserId, {
        $push: { notifications: notification._id },
      });
    } catch (error) {
      return error;
    }
  }
}
