import express from "express";
import bcrypt from "bcrypt";
import { IUser, IUserDb, userSchema } from "../models/UserModel";
import { validateCredential, validateUser } from "../validation/UserValidation";
import { sendOTP } from "../utility/SendMail";
import { generateTokens } from "../utility/generateToken";
import { verifyRefreshToken } from "../utility/verifyToken";
import mongoose from "mongoose";
import path from "path";
const fs = require("fs").promises;
export class UserController {
  /**
   * Handles user registration.
   */
  static async signUp(request: express.Request, response: express.Response) {
    try {
      const user: IUser = request.body;

      // Validate the user using Joi
      const { error } = validateUser(user);

      if (error)
        return response.status(400).json({ error: error.details[0].message });

      // Check if the user already exists
      const existingEmail = await userSchema.findOne({ email: user.email });
      if (existingEmail)
        return response.status(403).json({ error: "E-Mail already exists" });

      const existingUsername = await userSchema.findOne({
        username: user.username,
      });
      if (existingUsername)
        return response.status(403).json({ error: "Username already exists" });

      // Hash the user's password
      const salt = await bcrypt.genSalt(parseInt(process.env.SALT as string));
      user.password = await bcrypt.hash(user.password, salt);

      // Create and save the user using Mongoose
      const newUser = new userSchema(user);
      await newUser.save();

      response.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      response.status(500).json({ error: error });
    }
  }

  /**
   * Handles user login/authentication.
   */
  static async login(request: express.Request, response: express.Response) {
    try {
      const user: IUser = request.body;

      // Validate user credentials
      const { error } = validateCredential(user);
      if (error)
        return response.status(400).json({ error: error.details[0].message });

      // Check if a user with the provided email exists in the database
      let existingUser: IUserDb = (await userSchema.findOne({
        email: user.email,
      })) as IUserDb;

      if (existingUser) {
        if (bcrypt.compareSync(user.password, existingUser.password)) {
          const { accessToken, refreshToken } = await generateTokens(
            existingUser
          );

          return response.status(200).json({
            accessToken,
            refreshToken,
            id: existingUser.id,
            message: "User login successfully",
          });
        }
      } else {
        return response.status(400).json({ error: "Invalid Credential" });
      }
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Handles refreshing user access tokens using a refresh token.
   */
  static async refreshToken(
    request: express.Request,
    response: express.Response
  ) {
    try {
      verifyRefreshToken(request.body.refreshToken)
        .then(async ({ tokenDetails }) => {
          const responseTokenDetails = Object.assign(
            {} as IUserDb,
            tokenDetails
          );
          const { accessToken, refreshToken } = await generateTokens(
            responseTokenDetails
          );
          response.status(200).json({
            error: false,
            accessToken,
            refreshToken,
            message: "token created successfully",
          });
        })
        .catch((err) => response.status(400).json(err));
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Handles forgot password
   */
  static async forgotPassword(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const user: IUser = request.body;

      const existingUser = await userSchema.findOne({ email: user.email });
      if (!existingUser)
        return response.status(400).json({ error: "E-Mail doesn't exists" });

      const res = await sendOTP(existingUser.email);
      if (res?.status === 200) {
        existingUser.otp = res.OTP as string;
        await existingUser.save();
      }
      return response.status(res.status).json({
        message: res.message,
      });
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Handle OTP Verification
   */
  static async verifyOTP(request: express.Request, response: express.Response) {
    try {
      const { email, otp } = request.body;

      const existingUser = await userSchema.findOne({ email });
      if (!existingUser)
        return response.status(400).json({ error: "User not found" });

      if (existingUser.otp !== otp)
        return response.status(400).json({ error: "Invalid OTP" });

      return response
        .status(200)
        .json({ message: "OTP verification successful" });
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Handle Reset Password
   */
  static async resetPassword(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const { email, newPassword } = request.body;
      const existingUser = await userSchema.findOne({ email });
      if (!existingUser)
        return response.status(400).json({ error: "User not found" });

      const isPasswordValid = bcrypt.compareSync(
        newPassword,
        existingUser.password
      );

      if (isPasswordValid) {
        return response.status(400).json({
          error: "New password must be different from the old password",
        });
      }

      const salt = await bcrypt.genSalt(parseInt(process.env.SALT as string));
      const newUserPassword = await bcrypt.hash(newPassword, salt);

      existingUser.password = newUserPassword; // Update the password

      await existingUser.save();
      return response
        .status(200)
        .json({ message: "Password reset successful" });
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Handle to get user profile by ID
   */
  static async getUserByID(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.id;

      const existingUser = await userSchema
        .findById(new mongoose.Types.ObjectId(userId))
        .select("-password -__v -_id");

      if (!existingUser) {
        return response.status(404).json({ error: "User not found" });
      }

      // Return the user profile
      return response.status(200).json(existingUser);
    } catch (error) {
      response.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * handle follow user
   */

  static async followUser(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;
      const followerId = request.params.followerId;

      const user = await userSchema.findById(userId);
      const follower = await userSchema.findById(followerId);

      if (!user || !follower) {
        return response
          .status(404)
          .json({ message: "User or follower not found" });
      }

      // Check if user is already being followed
      if (user.following?.includes(new mongoose.Types.ObjectId(follower.id))) {
        return response
          .status(400)
          .json({ message: "User is already being followed" });
      }

      // Update user's followers and follower's following
      user.following?.push(new mongoose.Types.ObjectId(follower.id));
      follower.followers?.push(new mongoose.Types.ObjectId(user.id));

      await user.save();
      await follower.save();

      return response.json({ message: "Successfully followed" });
    } catch (error) {
      response.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * Handle unfollow user
   */
  static async unfollowUser(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;
      const followerId = request.params.followerId;

      // Assuming you have a User model
      const user = await userSchema.findById(userId);
      const follower = await userSchema.findById (followerId);

      if (!user || !follower) {
        return response
          .status(404)
          .json({ message: "User or follower not found" });
      }

      // Remove follower and following references

      if (
        user.following?.includes(new mongoose.Types.ObjectId(followerId)) &&
        follower.followers?.includes(new mongoose.Types.ObjectId(userId))
      ) {
        user.following = user.following?.filter(
          (id) => id.toString() !== followerId
        );
        follower.followers = follower.followers?.filter(
          (id) => id.toString() !== userId
        );
      } else {
        return response.json({message:"user already unfollowed"});
      }

      await user.save();
      await follower.save();

      return response.json({ message: "Successfully unfollowed" });
    } catch (error) {
      response.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * Handle upload profile image
   */

  static async updateProfileImage(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const userId = request.params.userId;
      const user = await userSchema.findById(userId);

      if (!user) {
        return response.status(404).json({ message: "User not found" });
      }

      const file = request.file;

      if (!file) {
        return response.status(400).json({ message: "No file uploaded" });
      }

      const basePath = "C:\\EchoBackend";

      // If user already has a profile image, delete the old file
      if (user.profileImage) {
        await fs.unlink(user.profileImage);
      }

      // Set the new profile image path and save the user
      user.profileImage = path.join(basePath, "uploads", file.filename);
      await user.save();

      response.json({ message: "Profile image updated successfully" });
    } catch (error) {
      response.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * Handles the search for users by name or username.
   */
  static async searchUsers(
    request: express.Request,
    response: express.Response
  ) {
    try {
      const term: string | undefined = request.query.search as string;

      if (!term) {
        return response.status(400).json({ error: "Search term is required" });
      }

      const regex = new RegExp(term, "i");
      const results = await userSchema.find({
        $or: [{ firstName: regex }, { lastName: regex }, { username: regex }],
      });

      const filteredResults = results.filter(user => user._id.toString() !== request.params.userId);

      const modifiedResults = filteredResults.map((user) => ({
        id: user._id,
        firstName: user.firstName,
        lastName:user.lastName,
        username: user.username,
        profileImage: user.profileImage,
        isFollowing: user.following?.includes(
          new mongoose.Types.ObjectId(request.params.userId)
        ),
      }));
      return response.json(modifiedResults);
    } catch (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }
}
