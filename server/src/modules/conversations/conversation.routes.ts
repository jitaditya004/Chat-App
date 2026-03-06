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




export default router;