import express from "express";
import { ChatController } from "../controllers/ChatController";

export const chatRoute: express.Router = express.Router();

chatRoute.post("/sendMessage", ChatController.sendMessage);
chatRoute.get("/getMessage/:roomId", ChatController.getMessage);
chatRoute.get("/getAllRooms/:userId", ChatController.getAllRooms);