import express from "express";
import mongoose from "mongoose";
import {
  IComment,
  IPostDb,
  commentSchema,
  postSchema,
} from "../models/PostModel";
import { userSchema } from "../models/UserModel";
import { commentNotification, likeNotification } from "../utility/notification";
import path from "path";
import { notificationSchema } from "../models/NotificationModel";
const fs = require("fs").promises;

export class PostController {
  /**
   * Handle create a new post
   */
  static async createPost(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const { userId, content, type } = request.body;
      /** old-code */
      // const audioFile = request.file; // Get the uploaded file

      /** new-code */
      const audioFile = request.body.filePath;

      const user = await userSchema.findById(userId);

      if (!user) {
        return response.status(404).json({ error: "User not found" });
      }

      // Check if both audio and text types are present
      if (audioFile && type === "text") {
        return response.status(400).json({
          error: "Cannot add both audio and text posts simultaneously",
        });
      }

      // const basePath = "C:\\EchoBackend"; // old-code

      if (type === "audio" && audioFile) {
        const newPost = new postSchema({
          userId,
          content,
          type,
          // audioFilePath: path.join(basePath, "audio", audioFile.filename), //old-code
          audioFilePath: audioFile,
        });
        await newPost.save();
      } else if (type === "text") {
        const newPost = new postSchema({
          userId,
          content,
          type,
          audioFilePath: null,
        });
        await newPost.save();
      } else {
        return response
          .status(400)
          .json({ error: "Invalid post type or missing file" });
      }

      return response
        .status(200)
        .json({ message: "Post created successfully" });
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Process a user's request to like a post.
   */
  static async likePost(request: express.Request, response: express.Response) {
    try {
      const { postId } = request.params;
      const { userId } = request.body;
      const post = await postSchema.findById(
        new mongoose.Types.ObjectId(postId)
      );
      if (!post) return response.status(404).json({ error: "Post not found" });
      if (post.likes.includes(userId))
        return response.status(400).json({ error: "Post already liked" });
      else {
        // User has not liked the post, add the like
        post.likes.push(userId);
        await post.save();

        likeNotification(userId, postId); // generate notification

        return response
          .status(200)
          .json({ message: "Post liked successfully" });
      }
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Process a user's request to unlike a post.
   */
  static async unlikePost(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const { postId } = request.params;
      const { userId } = request.body;
      const post = await postSchema.findById(
        new mongoose.Types.ObjectId(postId)
      );
      if (!post) return response.status(404).json({ error: "Post not found" });
      if (post.likes.includes(userId)) {
        const index = post.likes.indexOf(userId);
        post.likes.splice(index, 1);
        await post.save();
        return response
          .status(200)
          .json({ message: "Post like removed successfully" });
      }

      return response
        .status(404)
        .json({ error: "You haven't liked this post yet" });
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Handle adding a comment to a post.
   */
  static async addComment(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const { postId } = request.params;
      const { userId, text } = request.body;

      const post = await postSchema.findById(
        new mongoose.Types.ObjectId(postId)
      );
      if (!post) return response.status(404).json({ error: "Post not found" });

      const newCommentData: IComment = { userId, text };

      const newComment = await commentSchema.create(newCommentData);

      const commentId = newComment._id;

      post.comments.push(new mongoose.Types.ObjectId(commentId));

      await post.save();

      // Call the commentNotification function with the comment ID
      commentNotification(userId, postId, commentId);

      return response
        .status(200)
        .json({ message: "Comment added successfully", comment: newComment });
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Handle removing a comment from a post.
   */

  static async removeComment(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const { postId, commentId } = request.params;

      const post = await postSchema.findById(
        new mongoose.Types.ObjectId(postId)
      );
      if (!post) return response.status(404).json({ error: "Post not found" });

      const commentIndex = post.comments.findIndex(
        (comment) => comment.toString() === commentId
      );
      if (commentIndex === -1)
        return response.status(404).json({ error: "Comment not found" });

      const deletedCommentId = post.comments.splice(commentIndex, 1)[0];

      // Remove the comment from the Comment schema
      await commentSchema.findByIdAndDelete(deletedCommentId);

      await post.save();

      return response
        .status(200)
        .json({ message: "Comment deleted successfully" });
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Handle get comment by id
   */
  static async getCommentById(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const commentId = request.params.commentId;
      const comment = await commentSchema.findById(commentId).select("-__v");;

      if (!comment) {
        return response.status(404).json({ error: "Comment not found" });
      }
  
      return response.status(200).json(comment);
    } catch (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * generic fucntion for getting posts
   */
  static getPosts = async () => {
    const allPosts = await postSchema
      .find({ familyRoomId: { $exists: false } })
      .sort({ createdAt: -1 });
    const totalPost = [];

    for (const post of allPosts) {
      const postUser = await userSchema.findById(post.userId);
      const formattedPost: Record<string, any> = {
        username: postUser?.username,
        firstName: postUser?.firstName,
        lastName: postUser?.lastName,
        profileImage: postUser?.profileImage,
        isFollowed: false,
        postId: post._id,
        content: post.content,
        audioPath: post.audioFilePath,
        likes: post.likes,
        comments: post.comments,
        createdAt: post.createdAt,
      };
      totalPost.push(formattedPost);
    }
    return totalPost;
  };

  /**
   * get all post : Home screen || TODO : need to implement pagination.
   */
  static async getAllPost(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;
      const userData = await userSchema.findById(
        new mongoose.Types.ObjectId(userId)
      );
      if (!userData) {
        return response.status(404).json({ error: "User not found" });
      }

      const userFollowing = userData.following || [];
      let usersPosts = [];

      if (userFollowing.length === 0) {
        const totalPosts = await PostController.getPosts(); // Await the asynchronous call
        usersPosts = [...totalPosts];
      } else {
        const followingPosts = await postSchema.find({
          userId: { $in: userFollowing },
          familyRoomId: { $exists: false },
        });

        for (const post of followingPosts) {
          const postUser = await userSchema.findById(post.userId);
          const formattedPost: Record<string, any> = {
            username: postUser?.username,
            firstName: postUser?.firstName,
            lastName: postUser?.lastName,
            profileImage: postUser?.profileImage,
            isFollowed: true,
            postId: post._id,
            content: post.content,
            audioPath: post.audioFilePath,
            likes: post.likes,
            comments: post.comments,
            createdAt: post.createdAt,
          };
          usersPosts.push(formattedPost);
        }
        if (usersPosts.length === 0) {
          const totalPosts = await PostController.getPosts();
          usersPosts = totalPosts;
        }
      }

      // pagination

      const pageNumber = parseInt(request.query.page as string) || 1;
      const pageSize = 5;
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const posts = usersPosts.slice(startIndex, endIndex);

      response
        .status(200)
        .json({ posts, current: posts.length, total: usersPosts.length });
    } catch (error) {
      response.status(500).json({ error: error });
    }
  }

  /**
   * Handle - delete post
   */
  static async deletePost(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const postId = request.params.postId;

      const post = await postSchema.findById(
        new mongoose.Types.ObjectId(postId)
      );

      if (!post) return response.status(404).json({ error: "Post not found" });

      const message = await PostController.delete(post as IPostDb);

      return response.status(200).json({ message: message.message });
    } catch (error) {
      return response.status(500).json({ error: error });
    }
  }

  /**
   * generic delete post function
   */
  static delete = async (post: IPostDb) => {
    /** old-code */
    /* if (post.type === "audio") {
      const audioFilePath = post.audioFilePath;

      if (audioFilePath) {
        await fs.unlink(audioFilePath);
      }
    } */
    const comments = post.comments;

    comments.forEach(async (comment: any) => {
      await commentSchema.findByIdAndDelete(comment._id);
    });

    const notifications = await notificationSchema.find({ postId: post.id });
    const user = await userSchema.findById(post.userId);

    if (user) {
      // Remove notification IDs from the user's notifications array
      for (const notification of notifications) {
        const index = user.notifications.indexOf(notification.id.toString());
        if (index !== -1) {
          user.notifications.splice(index, 1);
        }
      }

      await user.save(); // Save the updated user document
    }

    // Delete associated notifications
    for (const notification of notifications) {
      await notificationSchema.findByIdAndDelete(notification.id);
    }

    await user?.save(); // Save the updated user document

    // Delete the post itself
    await postSchema.findByIdAndDelete(post.id);

    return { message: "post deleted successfully" };
  };
}
