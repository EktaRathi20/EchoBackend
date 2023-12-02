import express from "express";
import mongoose from "mongoose";
import { postSchema } from "../models/PostModel";

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
      response.status(500).send("Internal Server Error");
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
        return response
          .status(200)
          .json({ message: "Post liked successfully" });
      }
    } catch (error) {
      response.status(500).send("Internal Server Error");
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
      response.status(500).send("Internal Server Error");
    }
  }
}
