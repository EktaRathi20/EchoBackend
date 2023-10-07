import express from "express";
import bcrypt from "bcrypt";
import { IUser, userSchema } from "../models/UserModel";
import { validateCredential, validateUser } from "../validation/UserValidation";

// import Jwt from "jsonwebtoken"; // TODO | in future
export class UserController  {

  /**
   * Handles user registration.
   */
  static async signUp(request: express.Request, response: express.Response) {
    try {
      const user: IUser = request.body;

      // Validate the user using Joi
      const { error } = validateUser(user);
      if (error) return response.status(400).json({ error: error.details[0].message });

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

  /**
   * Handles user login/authentication.
   */
  static async login(request:express.Request, response:express.Response){
    try {
      const user: IUser = request.body;

      // Validate user credentials
      const {error} = validateCredential(user);
      if(error) return response.status(400).json({ error: error.details[0].message });

      // Check if a user with the provided email exists in the database
      const existingUser = await userSchema.findOne({ email: user.email });
      if (existingUser) {
        if(bcrypt.compareSync(user.password, existingUser.password)){

          // TODO | in future |  If the password matches, generate a JWT token 
          // const jwtToken = Jwt.sign({id:existingUser.id, email:existingUser.email}, "secret", {expiresIn:"24h"});
          return response.status(200).json({
            // jwtToken,
            user:existingUser,
            message: "User login successfully"
          })
        }
      }else{
        return response.status(400).json({ error: "Invalid Credential" });
      }

    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }
}
