import express from "express";
import multer from "multer";
import { storage } from "../utility/audioUpload";
import { PostController } from "../controllers/PostController";

const upload = multer({ storage });

export const postRoute: express.Router = express.Router();

/** old-code */
// postRoute.post("/createPost", upload.single('audio'), PostController.createPost);

/** new-code */
postRoute.post("/createPost", PostController.createPost);
postRoute.post("/likePost/:postId", PostController.likePost);
postRoute.post("/unlikePost/:postId", PostController.unlikePost);
postRoute.post('/commentPost/:postId', PostController.addComment);
postRoute.delete('/deletePostComment/:postId/:commentId', PostController.removeComment);
postRoute.get('/getComment/:commentId', PostController.getCommentById);
postRoute.get('/getAllPost/:userId', PostController.getAllPost);
postRoute.delete('/deletePost/:postId',PostController.deletePost)