import nodemailer from "nodemailer";
import crypto from "crypto";
export const sendOTP = async (to: string) => {
  const OTP = crypto.randomBytes(3).toString("hex").toUpperCase();
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "test@mail.com",
      pass: "",
    },
  });
  try {
    await transporter.sendMail({
      from: "test@mail.com",
      to: to,
      subject: "One Time Password",
      html: `Your reset password OTP is  ${OTP}`,
    });
    return {
      message: `Your reset password OTP is send to ${to}`,
      status: 200,
      OTP: OTP,
    };
  } catch (error) {
    return { message: error, status: 500 };
  }
};
