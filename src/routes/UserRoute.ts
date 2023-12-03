import express from "express";
import multer from "multer";
import { storage } from "../utility/imageUpload";
import { UserController } from "../controllers/UserController";
import { NotificationController } from "../controllers/NotificationController";

export const userRoute: express.Router = express.Router();
const upload = multer({ storage });

userRoute.get("/getUserByID/:id", UserController.getUserByID);
userRoute.post("/follow/:userId/:followerId", UserController.followUser);
userRoute.post("/unfollow/:userId/:followerId", UserController.unfollowUser);
userRoute.post("/uploadImg/:userId", upload.single("image"), UserController.updateProfileImage);
userRoute.get("/searchUser", UserController.searchUsers);

/**
 * notification route
 */
userRoute.get('/notification/:userId', NotificationController.getNotifications);