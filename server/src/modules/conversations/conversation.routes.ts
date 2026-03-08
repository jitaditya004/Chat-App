import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { ConversationModel } from "../../models/conversation.model";
import { UserModel } from "../../models/user.model";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user!.userId;

  const conversations = await ConversationModel.find({
    participants: userId
  })
    .sort({ updatedAt: -1 })
    .lean();

  const result = await Promise.all(
    conversations.map(async (c) => {
      const otherId = c.participants.find(
        (p) => p.toString() !== userId
      );

      const user = await UserModel.findById(otherId)
        .select("_id username")
        .lean();

      return {
        _id: c._id,
        otherUser: user,
        lastMessage: c.lastMessage
      };
    })
  );

  res.json(result);
});



router.post("/start", requireAuth, async (req, res) => {
  const myId = req.user!.userId;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      message: "userId required"
    });
  }

  if (myId === userId) {
    return res.status(400).json({
      message: "Cannot chat with yourself"
    });
  }

  let conversation = await ConversationModel.findOne({
    participants: { $all: [myId, userId] }
  });

  if (!conversation) {
    conversation = await ConversationModel.create({
      participants: [myId, userId]
    });
  }

  res.json({
    conversation: {
      _id: conversation._id
    }
  });
});


router.get("/:id", requireAuth, async (req, res) => {
  const myId = req.user!.userId
  const { id } = req.params

  const conversation = await ConversationModel.findById(id).lean()

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" })
  }

  if (!conversation.participants.some(p => p.toString() === myId)) {
    return res.status(403).json({ message: "Access denied" })
  }

  const otherId = conversation.participants.find(
    p => p.toString() !== myId
  )

  const user = await UserModel.findById(otherId)
    .select("_id username")
    .lean()

  res.json({
    otherUser: user
  })
});


router.post("/:id/read", requireAuth, async (req, res) => {

  const userId = req.user!.userId;
  const { id } = req.params;

  const convo = await ConversationModel.findById(id);

  if (!convo) return res.status(404).end();

  convo.unreadCount.set(userId, 0);

  await convo.save();

  res.json({ success: true });

});

export default router;