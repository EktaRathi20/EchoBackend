import Joi from "joi";
import { IUser } from "../models/UserModel";

export const validateUser = (user: IUser) => {
  const userValidationSchema = Joi.object().keys({
    firstName: Joi.string().alphanum().required(),
    lastName: Joi.string().alphanum().required(),
    ageGroup: Joi.string().required(),
    gender: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .required()
      .min(6)
      .max(20)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
        )
      ),
  });

  return userValidationSchema.validate(user);
};

export const validateCredential = (user: IUser) => {
  const credentialValidationSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string()
      .required()
      .min(6)
      .max(20)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
        )
      ),
  });
  return credentialValidationSchema.validate(user);
};