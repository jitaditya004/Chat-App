import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/user.model";
import { requireAuth } from "./auth.middleware";

const router = Router();

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const existing = await UserModel.findOne({ username });

  if (existing) {
    return res.status(409).json({ message: "User exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    username,
    password: hashed
  });

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET as string
  );

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax"
  });

  res.json({ success: true });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET as string
  );

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax"
  });

  res.json({ success: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.user!.userId)
    .select("_id username")
    .lean();

  res.json(user);
});


router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax"
  });

  res.json({ success: true });
});

export default router;