import { Router, Request, Response } from "express";
import { requireAuth } from "@/modules/auth/auth.middleware";
import { UserModel } from "@/models/user.model";

const router = Router();

router.get("/search", requireAuth, async (req: Request, res: Response) => {
  const q = req.query.q;

  if (typeof q !== "string" || q.length < 2) {
    return res.json([]);
  }

  const users = await UserModel.find({
    username: { $regex: q, $options: "i" },
    _id: { $ne: req.user.userId }
  })
    .select("_id username")
    .limit(10)
    .lean();

  res.json(users);
});


router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.user.userId)
    .select("_id username")
    .lean();

  res.json(user);
});


export default router;