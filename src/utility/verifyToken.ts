import jwt from "jsonwebtoken";
import { userTokenSchema } from "../models/UserTokenModel";

export const verifyRefreshToken = async (refreshToken: string) => {
    const privateKey: jwt.Secret = process.env.REFRESH_TOKEN_PRIVATE_KEY as jwt.Secret;

    try {
        const isExists = await userTokenSchema.findOne({ token: refreshToken });

        if (!isExists) {
            throw { error: true, message: "Invalid refresh token" };
        }

        const tokenDetails = jwt.verify(refreshToken, privateKey);

        return {
            tokenDetails,
            error: false,
            message: "Valid refresh token",
        };
    } catch (error) {
        throw { error: true, message: "Invalid refresh token" };
    }
};
