import express from "express";
import multer from "multer";
import { storage } from "../utility/imageUpload";
import { AuthController } from "../controllers/AuthController";
import { UserController } from "../controllers/UserController";
import { PostController } from "../controllers/PostController";

export const userRoute: express.Router = express.Router();
const upload = multer({ storage });

userRoute.post("/signUp", AuthController.signUp);
userRoute.post("/login", AuthController.login);
userRoute.post("/refreshToken", AuthController.refreshToken);
userRoute.post("/forgotPassword", AuthController.forgotPassword);
userRoute.post("/verifyOTP", AuthController.verifyOTP);
userRoute.post("/resetPassword", AuthController.resetPassword);
userRoute.get("/getUserByID/:id", UserController.getUserByID);
userRoute.post("/follow/:userId/:followerId", UserController.followUser);
userRoute.post("/unfollow/:userId/:followerId", UserController.unfollowUser);
userRoute.post(
  "/uploadImg/:userId",
  upload.single("image"),
  UserController.updateProfileImage
);
userRoute.get("/searchUser/:userId", UserController.searchUsers);
userRoute.post("/createPost", PostController.createPost);
userRoute.post("/likePost/:postId", PostController.likePost);
userRoute.post("/unlikePost/:postId", PostController.unlikePost);
userRoute.post('/commentPost/:postId', PostController.addComment);
userRoute.post('/deletePostComment/:postId/:commentId', PostController.removeComment);