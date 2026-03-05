import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}