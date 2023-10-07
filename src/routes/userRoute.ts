import express from "express";
import { UserController } from "../controllers/userController";

export const userRouter: express.Router = express.Router();

userRouter.post('/signUp', UserController .signUp);
userRouter.post('/login', UserController .login);