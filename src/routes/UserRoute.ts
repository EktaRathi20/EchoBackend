import express from "express";
import { UserController } from "../controllers/UserController";
import multer from "multer";
import { storage } from "../utility/imageUpload";

export const userRoute: express.Router = express.Router();
const upload = multer({ storage });

userRoute.post('/signUp', UserController .signUp);
userRoute.post('/login', UserController .login);
userRoute.post('/refreshToken', UserController.refreshToken);
userRoute.post('/forgotPassword', UserController.forgotPassword);
userRoute.post('/verifyOTP', UserController.verifyOTP);
userRoute.post('/resetPassword', UserController.resetPassword);
userRoute.get('/getUserByID/:id', UserController.getUserByID);
userRoute.post('/follow/:userId/:followerId', UserController.followUser);
userRoute.post('/unfollow/:userId/:followerId', UserController.unfollowUser);
userRoute.post('/uploadImg/:userId', upload.single("image") ,UserController.updateProfileImage);