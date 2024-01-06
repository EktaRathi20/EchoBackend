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
/** old-code */
// userRoute.put("/uploadImg/:userId", upload.single("image"), UserController.updateProfileImage);
/** new-code */
userRoute.put("/uploadImg/:userId", UserController.updateProfileImage);
userRoute.get("/searchUser", UserController.searchUsers);
userRoute.put("/changeUsername/:userId", UserController.changeUsername);
userRoute.put("/changeName/:userId", UserController.changeName);
userRoute.delete("/deleteUser/:userId", UserController.deleteUser);
userRoute.delete("/deleteProfilePhoto/:userId", UserController.deleteProfilePhoto);
userRoute.get("/getFollowerList/:userId", UserController.getFollowerList);
userRoute.get("/getFollowingList/:userId", UserController.getFollowerList);


/**
 * notification route
 */
userRoute.get('/notification/:userId', NotificationController.getNotifications);