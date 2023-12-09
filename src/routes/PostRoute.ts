import express from "express";
import multer from "multer";
import { storage } from "../utility/audioUpload";
import { PostController } from "../controllers/PostController";

const upload = multer({ storage });

export const postRoute: express.Router = express.Router();

postRoute.post("/createPost", upload.single('audio'), PostController.createPost);
postRoute.post("/likePost/:postId", PostController.likePost);
postRoute.post("/unlikePost/:postId", PostController.unlikePost);
postRoute.post('/commentPost/:postId', PostController.addComment);
postRoute.delete('/deletePostComment/:postId/:commentId', PostController.removeComment);
postRoute.get('/getAllPost/:userId', PostController.getAllPost);
postRoute.delete('/deletePost/:postId',PostController.deletePost)