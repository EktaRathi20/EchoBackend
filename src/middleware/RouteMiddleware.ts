import express from "express";
import Jwt from "jsonwebtoken";

export const routeMiddleware = async (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  if (
    request.path === "/api/signUp" ||
    request.path === "/api/login" ||
    request.path === "/api/forgotPassword" ||
    request.path === "/api/verifyOTP" ||
    request.path === "/api/resetPassword" ||
    request.path === "/api/refreshToken"
  )
    return next();

  const authHeader = request.headers.authorization;
  if(!authHeader) return response.status(401).json({ message: 'Access denied. Token not provided.' })

    const token = authHeader.split(" ")[1];

    Jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY as Jwt.Secret, (error, user) => {
      if (error) {
        return response.status(401).json({ message: 'Invalid or expired token.' });
      }
      next();
    });
  
};
