import { Router, Request, Response } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { UserModel } from "../../models/user.model";
import { ConversationModel } from "../../models/conversation.model";
import { Types } from "mongoose"; 

const router = Router();

router.get("/search", requireAuth, async (req: Request, res: Response) => {
  const q = req.query.q;

  if (typeof q !== "string" || q.length < 1) {
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



router.post("/mark-read", requireAuth, async (req, res) => {
  const { conversationId } = req.body;
  const userId = req.user!.userId;

  if (!Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ message: "Invalid conversationId" });
  }

  const conversation = await ConversationModel.findOne({
    _id: new Types.ObjectId(conversationId),
    participants: userId
  });

  if (!conversation) {
    return res.status(403).json({ message: "Access denied" });
  }

  conversation.unreadCount.set(userId, 0);

  await conversation.save();

  res.json({ success: true });
});




export default router;