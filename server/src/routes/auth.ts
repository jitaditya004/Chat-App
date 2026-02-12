import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user";
import { signToken } from "../utils/jwt";

const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, 
};


export const authRouter = Router();

/* ================= SIGN UP ================= */
authRouter.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  const existing = await UserModel.findOne({ username });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Username already exists",
    });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ username, password: hashed });

  const token = signToken(user._id.toString());

  res.cookie("token", token, authCookieOptions);

  res.status(201).json({
    success: true,
    message: "Signup successful",
  });
});

/* ================= LOGIN ================= */
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  const user = await UserModel.findOne({ username });
  if (!user || !user.password) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }

  const token = signToken(user._id.toString());

  res.cookie("token", token, authCookieOptions);

  res.json({
    success: true,
    message: "Login successful",
  });
});


authRouter.post("/logout", (_, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});


/* ================= ME ================= */
authRouter.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    const user = await UserModel.findById(decoded.userId).select("username");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});
