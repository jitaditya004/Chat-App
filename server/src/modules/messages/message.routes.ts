import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { MessageModel } from "../../models/message.model";
import { ConversationModel } from "../../models/conversation.model";
import { Types } from "mongoose";

const router = Router();

/* GET MESSAGES */


router.get("/:conversationId", requireAuth, async (req, res) => {
  const conversationId = req.params.conversationId as string;
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

  const messages = await MessageModel.find({
    conversationId: new Types.ObjectId(conversationId)
  })
    .sort({ createdAt: 1 })
    .lean();

  res.json(messages);
});

/* SEND MESSAGE */

router.post("/", requireAuth, async (req, res) => {
  const { conversationId, text } = req.body;

  const senderId = req.user!.userId;

  if (!Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ message: "Invalid conversationId" });
  }

  const conversation = await ConversationModel.findOne({
    _id: new Types.ObjectId(conversationId),
    participants: senderId
  });

  if (!conversation) {
    return res.status(403).json({ message: "Access denied" });
  }

  const msg = await MessageModel.create({
    conversationId: new Types.ObjectId(conversationId),
    senderId: new Types.ObjectId(senderId),
    text
  });

  await ConversationModel.findByIdAndUpdate(
    new Types.ObjectId(conversationId),
    { lastMessage: text }
  );

  res.json(msg);
});

export default router;