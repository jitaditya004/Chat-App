import jwt from "jsonwebtoken";

export const signToken = (userId: string): string =>
  jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
