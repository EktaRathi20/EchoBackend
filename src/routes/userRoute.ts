import express from "express";
import { CUser } from "../controllers";

export const RUser: express.Router = express.Router();

RUser.post('/signUp', CUser.signUp)