import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const generateTokens = async (payload: any) => {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });

  const hashedRT = await bcrypt.hash(refreshToken, 10);

  return { accessToken, refreshToken, hashedRT };
};
