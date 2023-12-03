import express from "express";
import { userSchema } from "../models/UserModel";
import mongoose from "mongoose";
import path from "path";
import { postSchema } from "../models/PostModel";
import { followNotification } from "../utility/notification";
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
        const { content, likes, comments, type, _id } = post;
        const formattedPost = { postId: _id, content, likes, comments };

        formattedPosts[type].push(formattedPost);
      });

      const existingUser = await userSchema
        .findById(new mongoose.Types.ObjectId(userId))
        .select("-password -__v -_id");

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
          .json({ message: "User or follower not found" });
      }

      // Check if user is already being followed
      if (user.following?.includes(new mongoose.Types.ObjectId(follower.id))) {
        return response
          .status(400)
          .json({ message: "User is already being followed" });
      }

      // Update user's followers and follower's following
      user.following?.push(new mongoose.Types.ObjectId(follower.id));
      follower.followers?.push(new mongoose.Types.ObjectId(user.id));

      await user.save();
      await follower.save();
      followNotification(userId, followerId);

      return response.json({ message: "Successfully followed" });
    } catch (error) {
      response.status(500).json({ message: "Internal Server Error" });
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
          .json({ message: "User or follower not found" });
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
        return response.json({ message: "user already unfollowed" });
      }

      await user.save();
      await follower.save();

      return response.json({ message: "Successfully unfollowed" });
    } catch (error) {
      response.status(500).json({ message: "Internal Server Error" });
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
        return response.status(404).json({ message: "User not found" });
      }

      const file = request.file;

      if (!file) {
        return response.status(400).json({ message: "No file uploaded" });
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
      response.status(500).json({ message: "Internal Server Error" });
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

      const filteredResults = results.filter(
        (user) => user._id.toString() !== request.params.userId
      );

      const modifiedResults = filteredResults.map((user) => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        profileImage: user.profileImage,
        isFollowing: user.following?.includes(
          new mongoose.Types.ObjectId(request.params.userId)
        ),
      }));
      return response.json(modifiedResults);
    } catch (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }
}
