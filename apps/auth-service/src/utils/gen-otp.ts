/* Generate numeric OTP with custom digits */
import crypto from "crypto";

export const generateOTP = (digits: number = 6): string => {
  const max = Math.pow(10, digits);
  const otp = crypto.randomInt(0, max);

  return otp.toString().padStart(digits, "0"); // ensures leading zeros
};
