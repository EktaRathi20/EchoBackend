import Jwt from "jsonwebtoken";
import { userTokenSchema, IToken } from "../models/UserTokenModel";
import { IUserDb } from "../models/UserModel";

export const generateTokens = async (user: IUserDb) => {
  try {
    const payload = { id: user.id, email: user.email };
    const accessToken = Jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_PRIVATE_KEY as Jwt.Secret,
      { expiresIn: "24h" }
    );
    const refreshToken = Jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_PRIVATE_KEY as Jwt.Secret,
      { expiresIn: "30d" }
    );

    const userToken: IToken | null = await userTokenSchema.findOne({
      userId: user.id,
    });
    if (userToken)
      await userTokenSchema.deleteOne({ userId: userToken?.userId });

    await new userTokenSchema({ userId: user.id, token: refreshToken }).save();
    return { accessToken, refreshToken };
  } catch (err) {
    throw err;
  }
};
