import express from "express";
import bcrypt from "bcrypt";
import { validateUser } from "../validation/userValidation";
import { IUser, userSchema } from "../models";

export class CUser {
  static async signUp(request: express.Request, response: express.Response) {
    try {
      const user: IUser = request.body;

      // Validate the user using Joi
      const { error } = validateUser(user);
      if (error) {
        return response.status(400).json({ error: error.details[0].message });
      }

      // Check if the user already exists
      const existingUser = await userSchema.findOne({ email: user.email });
      if (existingUser) {
        return response.status(403).json({ error: "E-Mail already exists" });
      }

      // Hash the user's password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

      // Create and save the user using Mongoose
      const newUser = new userSchema(user);
      await newUser.save();

      response.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }
}

