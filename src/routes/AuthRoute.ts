import express from "express";
import { AuthController } from "../controllers/AuthController";

export const authRoute: express.Router = express.Router();

authRoute.post("/signUp", AuthController.signUp);
authRoute.post("/login", AuthController.login);
authRoute.post("/refreshToken", AuthController.refreshToken);
authRoute.post("/forgotPassword", AuthController.forgotPassword);
authRoute.post("/verifyOTP", AuthController.verifyOTP);
authRoute.put("/resetPassword", AuthController.resetPassword);