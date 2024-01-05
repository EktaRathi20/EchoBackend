import express from "express";
import bcrypt from "bcrypt";
import { IUser, IUserDb, userSchema } from "../models/UserModel";
import { validateCredential, validateUser } from "../validation/UserValidation";
import { sendOTP } from "../utility/SendMail";
import { generateTokens } from "../utility/generateToken";
import { verifyRefreshToken } from "../utility/verifyToken";
export class AuthController {
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
        .catch((err) => response.status(400).json({ error: err }));
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
}
