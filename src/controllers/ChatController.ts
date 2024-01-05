import express from "express";
import { chatRoomSchema, chatSchema } from "../models/ChatModel";
export class ChatController {
  static async sendMessage(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const { senderId, receiverId, message } = request.body;

      const existingRoom = await chatRoomSchema.findOne({
        $or: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      });

      let roomId;

      if (!existingRoom) {
        // If the room doesn't exist, create a new one
        const newRoom = await chatRoomSchema.create({
          senderId: senderId,
          receiverId: receiverId,
        });

        roomId = newRoom._id;
      } else {
        // If the room already exists, use its roomId
        roomId = existingRoom._id;
      }

      // Create and save the chat message
      const chatMessage = await chatSchema.create({
        roomId: roomId,
        userId: senderId,
        message: message,
        createdAt: Date.now(),
      });

      return response.status(200).json({
        roomId: roomId,
      });
    } catch (error) {
      return response.status(500).json({ error: "Internal server error" });
    }
  }

  static async getMessage(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const roomId = request.params.roomId;
      const allChats = await chatSchema.find(
        { roomId: roomId },
        { userId: 1, message: 1, createdAt: 1 }
      );

      return response.status(200).json(allChats);
    } catch (error) {
      return response.status(500).json({ error: "Internal server error" });
    }
  }

  static async getAllRooms(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;
      const allRoom = await chatRoomSchema.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      });
      if (allRoom.length > 0) {
        return response.status(200).json(allRoom);
      }else{
        return response.status(404).json({error:"no record found"});
      }
    } catch (error) {
      return response.status(500).json({ error: "Internal server error" });
    }
  }

}
