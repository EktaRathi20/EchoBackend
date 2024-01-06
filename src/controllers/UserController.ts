import express from "express";
import { IUser, IUserDb, userSchema } from "../models/UserModel";
import mongoose from "mongoose";
import path from "path";
import { IPostDb, postSchema } from "../models/PostModel";
import { followNotification } from "../utility/notification";
import { PostController } from "./PostController";
import { chatRoomSchema, chatSchema } from "../models/ChatModel";
import { notificationSchema } from "../models/NotificationModel";
const fs = require("fs").promises;
export class UserController {
  /**
   * Handle to get user profile by ID
   */
  static async getUserByID(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.id;

      const userPosts = await postSchema.find({ userId });

      const formattedPosts = {
        audio: [] as any,
        text: [] as any,
      };

      userPosts.forEach((post) => {
        const { content, likes, comments, type, _id, audioFilePath } = post;
        const formattedPost = {
          postId: _id,
          content,
          audioFilePath,
          likes,
          comments,
        };

        formattedPosts[type].push(formattedPost);
      });

      const existingUser = await userSchema
        .findById(new mongoose.Types.ObjectId(userId))
        .select("-password -__v");

      if (!existingUser) {
        return response.status(404).json({ error: "User not found" });
      }

      const userWithPosts = {
        ...existingUser.toObject(),
        posts: formattedPosts,
      };

      // Return the user profile
      return response.status(200).json(userWithPosts);
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * handle follow user
   */

  static async followUser(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;
      const followerId = request.params.followerId;

      const user = await userSchema.findById(userId);
      const follower = await userSchema.findById(followerId);

      if (!user || !follower) {
        return response
          .status(404)
          .json({ error: "User or follower not found" });
      }

      // Check if user is already being followed
      if (user.following?.includes(new mongoose.Types.ObjectId(follower.id))) {
        return response
          .status(400)
          .json({ error: "User is already being followed" });
      }

      // Update user's followers and follower's following
      user.following?.push(new mongoose.Types.ObjectId(follower.id));
      follower.followers?.push(new mongoose.Types.ObjectId(user.id));

      await user.save();
      await follower.save();
      followNotification(userId, followerId);

      return response.json({ message: "Successfully followed" });
    } catch (error) {
      response.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * Handle unfollow user
   */
  static async unfollowUser(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;
      const followerId = request.params.followerId;

      // Assuming you have a User model
      const user = await userSchema.findById(userId);
      const follower = await userSchema.findById(followerId);

      if (!user || !follower) {
        return response
          .status(404)
          .json({ error: "User or follower not found" });
      }

      // Remove follower and following references

      if (
        user.following?.includes(new mongoose.Types.ObjectId(followerId)) &&
        follower.followers?.includes(new mongoose.Types.ObjectId(userId))
      ) {
        user.following = user.following?.filter(
          (id) => id.toString() !== followerId
        );
        follower.followers = follower.followers?.filter(
          (id) => id.toString() !== userId
        );
      } else {
        return response.json({ error: "user already unfollowed" });
      }

      await user.save();
      await follower.save();

      return response.json({ message: "Successfully unfollowed" });
    } catch (error) {
      response.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * Handle upload profile image
   */

  static async updateProfileImage(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;
      const user = await userSchema.findById(userId);

      if (!user) {
        return response.status(404).json({ error: "User not found" });
      }

      const file = request.file;

      if (!file) {
        return response.status(400).json({ error: "No file uploaded" });
      }

      const basePath = "C:\\EchoBackend";

      // If user already has a profile image, delete the old file
      if (user.profileImage) {
        await fs.unlink(user.profileImage);
      }

      // Set the new profile image path and save the user
      user.profileImage = path.join(basePath, "uploads", file.filename);
      await user.save();

      response.json({ message: "Profile image updated successfully" });
    } catch (error) {
      response.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * delete profile photo
   */
  static async deleteProfilePhoto(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;
      const user = await userSchema.findById(userId);

      if (!user) {
        return response.status(404).json({ error: "User not found" });
      }

      if (user.profileImage) {
        await fs.unlink(user.profileImage);
        // Remove the profileImage path from userSchema
        user.profileImage = "";

        // Save the updated user document
        await user.save();
        return response
        .status(200)
        .json({ message: "Profile photo deleted successfully" });
      }else{
        return response
        .status(404)
        .json({ message: "No Profile photo." });
      }


    } catch (error) {
      response.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * Handles the search for users by name or username.
   */
  static async searchUsers(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const term: string | undefined = request.query.search as string;

      if (!term) {
        return response.status(400).json({ error: "Search term is required" });
      }

      const regex = new RegExp(term, "i");
      const results = await userSchema.find({
        $or: [{ firstName: regex }, { lastName: regex }, { username: regex }],
      });

      const modifiedResults = results.map((user) => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        profileImage: user.profileImage,
        isFollowing: user.following?.includes(
          new mongoose.Types.ObjectId(request.params.userId)
        ),
      }));
      return response.status(200).json(modifiedResults);
    } catch (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }

  /* Settings */
  /**
   * Handle - change username
   */
  static async changeUsername(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;
      const user = await userSchema.findById(userId);

      if (!user) {
        return response.status(404).json({ error: "User not found" });
      }

      // Extract the fields to update from the request body
      const { username } = request.body;

      // Create an object with the fields to update
      const updateFields: Partial<IUserDb> = {};
      if (username) updateFields.username = username;

      // Update the user information in the database
      const updatedUser = await userSchema.findByIdAndUpdate(
        userId,
        updateFields,
        { new: true }
      );

      if (!updatedUser) {
        return response.status(404).json({ error: "User not found" });
      }

      // Send the updated user information as a response

      await updatedUser.save();
      return response.json({ message: "username updated successfully" });
    } catch (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * Handle - change Name
   */
  static async changeName(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;

      const user = await userSchema.findById(userId);

      if (!user) {
        return response.status(404).json({ error: "User not found" });
      }

      // Extract the fields to update from the request body
      const { firstName, lastName } = request.body;

      // Create an object with the fields to update
      const updateFields: Partial<IUserDb> = {};
      if (firstName) updateFields.firstName = firstName;
      if (lastName) updateFields.lastName = lastName;

      // Update the user information in the database
      const updatedUser = await userSchema.findByIdAndUpdate(
        userId,
        updateFields,
        { new: true }
      );

      if (!updatedUser) {
        return response.status(404).json({ error: "User not found" });
      }

      await updatedUser.save();
      // Send the updated user information as a response
      return response.json({ message: "Name updated successfully" });
    } catch (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * Handle - delete user
   */
  static async deleteUser(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;

      const user = await userSchema.findById(userId);

      if (!user) {
        return response.status(404).json({ error: "User not found" });
      }

      const posts = await postSchema.find({ userId });
      for (const post of posts) {
        // Delete post and remove associated comments
        await PostController.delete(post as IPostDb);
      }

      const chatRooms = await chatRoomSchema.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      });

      for (const room of chatRooms) {
        // Delete all chat messages within the chat room
        await chatSchema.deleteMany({ roomId: room.id });
      }

      const notifications = await notificationSchema.find({
        $or: [{ userId: user.id }, { followerId: user.id }],
      });

      const followerIds = user.followers;
      const followingIds = user.following;

      if (followerIds) {
        for (const followerId of followerIds) {
          const follower = await userSchema.findById(followerId);
          if (follower) {
            // Remove the user being deleted from the follower's following list
            follower.following = follower?.following?.filter(
              (id) => !id.equals(userId)
            );
            for (const notification of notifications) {
              follower.notifications = follower.notifications?.filter(
                (id) => id != notification.id
              );
            }
            await follower.save();
          }
        }
      }

      if (followingIds) {
        for (const followingId of followingIds) {
          const following = await userSchema.findById(followingId);
          if (following) {
            // Remove the user being deleted from the following user's follower list
            following.followers = following?.followers?.filter(
              (id) => !id.equals(userId)
            );
            for (const notification of notifications) {
              following.notifications = following.notifications?.filter(
                (id) => id != notification.id
              );
            }
            await following.save();
          }
        }
      }

      await notificationSchema.deleteMany({
        $or: [{ userId: user.id }, { followerId: user.id }],
      });
      await userSchema.findByIdAndDelete(userId);
      return response.json({ message: "User account deleted successfully" });
    } catch (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * Handle - getFollowerList
   */

  static async getFollowerList(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;
      const existingUser = await userSchema
        .findById(new mongoose.Types.ObjectId(userId))
        .select("-password -__v -_id");

      if (!existingUser) {
        return response.status(404).json({ error: "User not found" });
      }

      const followerIds = existingUser.followers;
      const followerDetails = await userSchema
        .find({ _id: { $in: followerIds } })
        .select("firstName lastName username profileImage following");

      const modifiedResults = followerDetails?.map((user) => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        profileImage: user.profileImage,
        isFollowing: user.following?.includes(
          new mongoose.Types.ObjectId(userId)
        ),
      }));

      response.status(200).json(modifiedResults);
    } catch (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * Handle - getFollowingList
   */

  static async getFollowingList(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;
      const existingUser = await userSchema
        .findById(new mongoose.Types.ObjectId(userId))
        .select("-password -__v -_id");

      if (!existingUser) {
        return response.status(404).json({ error: "User not found" });
      }

      const followerIds = existingUser.following;
      const followerDetails = await userSchema
        .find({ _id: { $in: followerIds } })
        .select("firstName lastName username profileImage following");

      const modifiedResults = followerDetails?.map((user) => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        profileImage: user.profileImage,
        isFollowing: true,
      }));

      response.status(200).json(modifiedResults);
    } catch (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }
}
