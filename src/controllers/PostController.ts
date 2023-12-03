import express from "express";
import mongoose from "mongoose";
import { IComment, commentSchema, postSchema } from "../models/PostModel";
import { userSchema } from "../models/UserModel";
import { NotificationController } from "./NotificationController";

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
      const newPost = new postSchema({ userId, content, type });
      await newPost.save();
      return response
        .status(200)
        .json({ message: "post created successfully" });
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
      if (!post) return response.status(404).send("Post not found");
      if (post.likes.includes(userId))
        return response.status(200).json({ message: "Post already liked" });
      else {
        // User has not liked the post, add the like
        post.likes.push(userId);
        await post.save();
        NotificationController.createNotification(userId, "like", postId);
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
      if (!post) return response.status(404).send("Post not found");
      if (post.likes.includes(userId)) {
        const index = post.likes.indexOf(userId);
        post.likes.splice(index, 1);
        await post.save();
        return response
          .status(200)
          .json({ message: "Post like removed successfully" });
      }

      return response
        .status(200)
        .json({ message: "You haven't liked this post yet" });
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
      if (!post) return response.status(404).send("Post not found");

      const newCommentData: IComment = { userId, text };

      const newComment = await commentSchema.create(newCommentData);

      post.comments.push(new mongoose.Types.ObjectId(newComment._id));

      await post.save();
      NotificationController.createNotification(userId, "comment", postId);

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
      if (!post) return response.status(404).send("Post not found");

      const commentIndex = post.comments.findIndex(
        (comment) => comment.toString() === commentId
      );
      if (commentIndex === -1)
        return response.status(404).send("Comment not found");

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
   * get all post : Home screen
   */
  static async getAllPost(request: express.Request, response: express.Response) {
    try {
      const userId = request.params.userId;
      const userData = await userSchema.findById(
        new mongoose.Types.ObjectId(userId)
      );
      if (!userData) {
        return response.status(404).json({ error: "User not found" });
      }
      const userFollowing = userData.following || [];
      const usersPosts: Record<string, any>[] = [];

      if (userFollowing.length === 0) {
        const allPosts = await postSchema.find({}).sort({ createdAt: -1 });

        const totalPost: Record<string, any> = {
          text: [],
          audio: [],
        };
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
            likes: post.likes,
            comments: post.comments,
            createdAt: post.createdAt,
          };
          totalPost[post.type].push(formattedPost);
        }

        usersPosts.push(totalPost);
      } else {
        await Promise.all(
          userFollowing.map(async (user) => {
            const followingPosts = await postSchema.find({ userId: user });

            const totalPost: Record<string, any> = {
              text: [],
              audio: [],
            };

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
                likes: post.likes,
                comments: post.comments,
                createdAt: post.createdAt,
              };
              totalPost[post.type].push(formattedPost);
            }

            usersPosts.push(totalPost);
          })
        );
      }
      response.status(200).json(usersPosts);
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }
}
