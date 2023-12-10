import express from "express";
import { FamilyRoom } from "../models/FamilyModel";
import { userSchema } from "../models/UserModel";

export class FamilyController {
  /**
   * Get all family rooms
   */
  static async getFamilyRooms(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;

      const familyRooms = await FamilyRoom.find({
        $or: [{ creatorId: userId }, { members: { $in: [userId] } }]
      }, "_id familyName");

      return response.status(200).json({ familyRooms });
    } catch (error) {
      return response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Create family room
   */
  static async createFamilyRoom(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const { userId, accessKey, familyName } = request.body;

      const user = await userSchema.findById(userId);
      if (!user) {
        return response.status(400).json({ message: "user not found" });
      }

      if (!accessKey) {
        return response.status(400).json({ message: "provide access key" });
      }

      if (!familyName) {
        return response.status(400).json({ message: "provide family name" });
      }
      const family = await FamilyRoom.create({
        creatorId: userId,
        accessKey: accessKey,
        familyName: familyName,
      });
      return response.status(200).json({ message: "Family room created successfully", family });

    } catch (error) {
      return response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Join family room
   */
  static async joinFamilyRoom(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const { userId, familyName, accessKey } = request.body;

      const familyRoom = await FamilyRoom.findOne({
        familyName: familyName,
        accessKey: accessKey,
      });

      if (!familyRoom) {
        return response.status(404).json({ error: "Family room not found" });
      }

      // Check if the user is already a member of the family room
      if (familyRoom.members.includes(userId)) {
        return response.status(400).json({ error: "User is already a member" });
      }

      // Add the user to the members array
      familyRoom.members.push(userId);
      await familyRoom.save();

      response
        .status(200)
        .json({ message: "Successfully joined the family room" });
    } catch (error) {
      return response.status(500).json({ error: "Internal server error" });
    }
  }
  /**
   * get family room by Id
   */
  static async getFamilyById(
    request: express.Request,
    response: express.Response
  ) {
    try {
        const roomId = request.params.roomId;
        const familyRoom = await FamilyRoom.findById(roomId);
        if(!familyRoom){
            return response.status(400).json({ error: "family room doesn't exist" });
        }
        return response.status(200).json({familyRoom});

    } catch (error) {
      return response.status(500).json({ error: "Internal server error" });
    }
  }


  /**
   * get all family room post
   */
  static async getFamilyPost(
    request: express.Request,
    response: express.Response
  ) {
    try {
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * create family post
   */

  static async createFamilyPost(
    request: express.Request,
    response: express.Response
  ) {
    try {
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }
}
