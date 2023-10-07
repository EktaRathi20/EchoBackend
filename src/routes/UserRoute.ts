import express from "express";
import { UserController } from "../controllers/UserController";

export const userRoute: express.Router = express.Router();

userRoute.post('/signUp', UserController .signUp);
userRoute.post('/login', UserController .login);