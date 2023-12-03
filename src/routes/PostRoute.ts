import express from "express";
import { PostController } from "../controllers/PostController";

export const postRoute: express.Router = express.Router();

postRoute.post("/createPost", PostController.createPost);
postRoute.post("/likePost/:postId", PostController.likePost);
postRoute.post("/unlikePost/:postId", PostController.unlikePost);
postRoute.post('/commentPost/:postId', PostController.addComment);
postRoute.post('/deletePostComment/:postId/:commentId', PostController.removeComment);
postRoute.get('/getAllPost/:userId', PostController.getAllPost);