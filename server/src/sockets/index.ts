import { Server, Socket } from "socket.io";
import { MessageModel } from "../models/message";

export const registerSocketHandlers = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    socket.on("join-conversation", (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on(
      "send-message",
      async (
        payload: { conversationId: string; senderId: string; text: string },
        ack
      ) => {
        const msg = await MessageModel.create({
          conversationId: payload.conversationId,
          senderId: payload.senderId,
          text: payload.text,
          status: "sent",
        });

        io.to(payload.conversationId).emit("new-message", msg);
        ack({ success: true, messageId: msg._id });
      }
    );

    socket.on("disconnect", () => {});
  });
};
