import jwt from "jsonwebtoken";

export const generateToken = (payload: object, expiresIn: string | number) => {
    const secretKey: jwt.Secret = process.env.JWT || "default_secret_key";
    return jwt.sign(payload, secretKey, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
}
