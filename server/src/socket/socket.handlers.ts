import { Server, Socket } from "socket.io";
import { MessageModel } from "../models/message.model";
import { ConversationModel } from "../models/conversation.model";

const onlineUsers = new Map<string, string>();

type AckResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
};

export function registerSocketHandlers(
  io: Server,
  socket: Socket
) {
  const userId = socket.data.userId;

  // --------------------------------
  // General socket event logger
  // --------------------------------

  socket.onAny((event, ...args) => {
    console.log("📡 SOCKET EVENT:", event, args);
  });

  // --------------------------------
  // General socket error handler
  // --------------------------------

  socket.on("error", (error) => {
    console.error(
      `❌ Socket error [${socket.id}]:`,
      error
    );
  });

  // --------------------------------
  // User connected
  // --------------------------------

  console.log("👤 User connected:", socket.id);

  if (!userId) {
    console.error(
      `❌ Socket ${socket.id} connected without userId`
    );

    socket.disconnect(true);
    return;
  }

  onlineUsers.set(userId, socket.id);
  socket.join(userId);

  io.emit(
    "online-users",
    Array.from(onlineUsers.keys())
  );

  // --------------------------------
  // Join conversation
  // --------------------------------

  socket.on(
    "join-conversation",
    async (
      conversationId: string,
      ack?: (response: AckResponse) => void
    ) => {
      try {
        if (!conversationId) {
          return ack?.({
            success: false,
            message: "Conversation ID is required",
          });
        }

        const conversation =
          await ConversationModel.findOne({
            _id: conversationId,
            participants: userId,
          });

        if (!conversation) {
          return ack?.({
            success: false,
            message: "Access denied",
          });
        }

        await socket.join(conversationId);

        console.log(
          `👥 ${userId} joined conversation ${conversationId}`
        );

        ack?.({
          success: true,
        });
      } catch (error) {
        console.error(
          "join-conversation error:",
          error
        );

        ack?.({
          success: false,
          message: "Failed to join conversation",
        });
      }
    }
  );

  // --------------------------------
  // Typing
  // --------------------------------

  socket.on(
    "typing",
    (
      { conversationId }: { conversationId: string },
      ack?: (response: AckResponse) => void
    ) => {
      try {
        if (!conversationId) {
          return ack?.({
            success: false,
            message: "Conversation ID is required",
          });
        }

        socket
          .to(conversationId)
          .emit("user-typing", {
            userId,
          });

        ack?.({
          success: true,
        });
      } catch (error) {
        console.error("❌ typing error:", error);

        ack?.({
          success: false,
          message: "Failed to send typing event",
        });
      }
    }
  );

  // --------------------------------
  // Send message
  // --------------------------------

  socket.on(
    "send-message",
    async (
      payload,
      ack?: (response: AckResponse) => void
    ) => {
      try {
        if (!payload?.conversationId) {
          return ack?.({
            success: false,
            message: "Conversation ID is required",
          });
        }

        if (
          typeof payload.text !== "string" ||
          !payload.text.trim()
        ) {
          return ack?.({
            success: false,
            message: "Message cannot be empty",
          });
        }

        const conversation =
          await ConversationModel.findOne({
            _id: payload.conversationId,
            participants: userId,
          });

        if (!conversation) {
          return ack?.({
            success: false,
            message: "Access denied",
          });
        }

        const msg = await MessageModel.create({
          conversationId: payload.conversationId,
          senderId: userId,
          text: payload.text.trim(),
        });

        // --------------------------------
        // Update unread count
        // --------------------------------

        const otherUser =
          conversation.participants.find(
            (p) => p.toString() !== userId
          );

        if (otherUser) {
          const otherId = otherUser.toString();

          const current =
            conversation.unreadCount.get(otherId) ?? 0;

          conversation.unreadCount.set(
            otherId,
            current + 1
          );
        }

        // --------------------------------
        // Update last message
        // --------------------------------

        conversation.lastMessage =
          payload.text.trim();

        await conversation.save();

        // --------------------------------
        // Broadcast message
        // --------------------------------

        // io.to(payload.conversationId).emit(
        //   "new-message",
        //   msg
        // );

        for (const participantId of conversation.participants) {
          io.to(participantId.toString()).emit(
            "new-message",
            msg
          );
        }

        // --------------------------------
        // Acknowledge success
        // --------------------------------

        ack?.({
          success: true,
          data: msg,
        });
      } catch (error) {
        console.error(
          "❌ send-message error:",
          error
        );

        ack?.({
          success: false,
          message: "Failed to send message",
        });
      }
    }
  );

  // --------------------------------
  // Stop typing
  // --------------------------------

  socket.on(
    "stop-typing",
    (
      { conversationId }: { conversationId: string },
      ack?: (response: AckResponse) => void
    ) => {
      try {
        if (!conversationId) {
          return ack?.({
            success: false,
            message: "Conversation ID is required",
          });
        }

        socket
          .to(conversationId)
          .emit("user-stop-typing", {
            userId,
          });

        ack?.({
          success: true,
        });
      } catch (error) {
        console.error(
          "❌ stop-typing error:",
          error
        );

        ack?.({
          success: false,
          message: "Failed to stop typing",
        });
      }
    }
  );

  // --------------------------------
  // Disconnect
  // --------------------------------

  socket.on("disconnect", (reason) => {
    console.log(
      "👋 User disconnected:",
      socket.id,
      reason
    );

    // Only remove this socket's user
    // if this socket is still the active socket.
    if (onlineUsers.get(userId) === socket.id) {
      onlineUsers.delete(userId);
    }

    io.emit(
      "online-users",
      Array.from(onlineUsers.keys())
    );
  });
}