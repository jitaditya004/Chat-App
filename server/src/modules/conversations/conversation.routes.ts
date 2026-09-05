import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { ConversationModel } from "../../models/conversation.model";
import { UserModel } from "../../models/user.model";
import mongoose from "mongoose";

const router = Router();

// ========================================
// Get all conversations
// ========================================

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;

    const conversations = await ConversationModel.find({
      participants: userId,
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

        const unread = c.unreadCount?.[userId] || 0;

        return {
          _id: c._id,
          otherUser: user,
          lastMessage: c.lastMessage,
          unread,
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error(
      "Get conversations error:",
      error
    );

    res.status(500).json({
      message: "Failed to load conversations",
    });
  }
});

// ========================================
// Start / get conversation
// ========================================

router.post("/start", requireAuth, async (req, res) => {
  try {
    const myId = req.user!.userId;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId",
      });
    }

    if (myId === userId) {
      return res.status(400).json({
        message: "Cannot chat with yourself",
      });
    }

    // Check that the other user actually exists
    const user = await UserModel.findById(userId)
      .select("_id username")
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let conversation =
      await ConversationModel.findOne({
        participants: {
          $all: [myId, userId],
        },
      });

    if (!conversation) {
      conversation =
        await ConversationModel.create({
          participants: [myId, userId],
          unreadCount: {
            [myId]: 0,
            [userId]: 0,
          },
        });
    }

    res.json({
      conversation: {
        _id: conversation._id,
      },
    });
  } catch (error) {
    console.error(
      "Start conversation error:",
      error
    );

    res.status(500).json({
      message: "Failed to start conversation",
    });
  }
});

// ========================================
// Get single conversation
// ========================================

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const myId = req.user!.userId;
    const { id } = req.params as {id: string};

    // Prevent MongoDB CastError
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    const conversation =
      await ConversationModel.findById(id).lean();

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    // Authorization check
    if (
      !conversation.participants.some(
        (p) => p.toString() === myId
      )
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const otherId = conversation.participants.find(
      (p) => p.toString() !== myId
    );

    if (!otherId) {
      return res.status(400).json({
        message: "Invalid conversation",
      });
    }

    const user = await UserModel.findById(otherId)
      .select("_id username")
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "Other user not found",
      });
    }

    res.json({
      otherUser: user,
    });
  } catch (error) {
    console.error(
      "Get conversation error:",
      error
    );

    res.status(500).json({
      message: "Failed to load conversation",
    });
  }
});

// ========================================
// Mark conversation as read
// ========================================

router.post("/:id/read", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params as {id:string};

    // Prevent MongoDB CastError
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid conversation ID",
      });
    }

    // Find conversation AND verify user is a participant
    const convo =
      await ConversationModel.findOne({
        _id: id,
        participants: userId,
      });

    if (!convo) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    convo.unreadCount.set(userId, 0);

    await convo.save();

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Mark conversation as read error:",
      error
    );

    res.status(500).json({
      message: "Failed to mark conversation as read",
    });
  }
});

export default router;