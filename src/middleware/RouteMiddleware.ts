import express from "express";
import { verifyRefreshToken } from "../utility/verifyToken";
import { IToken } from "../models/UserModel";

export const routeMiddleware = async (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {

  if (
    request.path === "/api/signup" ||
    request.path === "/api/signin" ||
    request.path === "/api/forgotPassword" ||
    request.path === "/api/verifyOTP" ||
    request.path === "/api/resetPassword" ||
    request.path === "api/refreshToken"
  )  return next();

  const token: IToken = request.body.accessToken;
  if (!token)
    return response
      .status(401)
      .json({ error: "Unauthorized: Token is missing." });
  try {
    const user = await verifyRefreshToken(token);
    if (user) {
      request.body.user = user;
      next(); // Proceed to the next middleware or route handler
    } else {
      return response
        .status(403)
        .json({ error: "Forbidden: Token is invalid." });
    }
  } catch (error) {
    return response.status(403).json({ error: "Forbidden: Token is invalid." });
  }
  next();
};
