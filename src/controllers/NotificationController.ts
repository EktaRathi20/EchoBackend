import express from "express";
import { userSchema } from "../models/UserModel";
import { notificationSchema } from "../models/NotificationModel";

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
          if(element.type === 'like'){
            totalNotification[element.type].push({
              profileImage: user?.profileImage,
              username: user?.username,
              userId: element.userId,
              postId: element.postId,
              createdAt: element.createdAt,
            });
          }else if(element.type === 'comment'){
            totalNotification[element.type].push({
              profileImage: user?.profileImage,
              username: user?.username,
              userId: element.userId,
              postId: element.postId,
              commentId:element.commentId,
              createdAt: element.createdAt,
            });

          }else if(element.type === 'follow'){
            totalNotification[element.type].push({
              profileImage: user?.profileImage,
              username: user?.username,
              userId: element.userId,
              followerId: element.followerId,
              createdAt: element.createdAt,
            });

          }else{
            //nothing
          }
        }
      }

      response.status(200).json({ notification: totalNotification });
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }


}
