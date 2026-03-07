import { Server, Socket } from "socket.io"
import { MessageModel } from "../models/message.model"
import { ConversationModel } from "../models/conversation.model"

export function registerSocketHandlers(io: Server, socket: Socket) {

  console.log("user connected", socket.id)

  socket.on("join-conversation", (conversationId: string) => {
    socket.join(conversationId)
  })

  socket.on(
    "send-message",
    async (
      payload: { conversationId: string; text: string; senderId: string },
      ack?: (response: { success: boolean }) => void
    ) => {

      const msg = await MessageModel.create({
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        text: payload.text
      })

      await ConversationModel.findByIdAndUpdate(
        payload.conversationId,
        { lastMessage: payload.text }
      )

      io.to(payload.conversationId).emit("new-message", msg)

      ack?.({ success: true })
    }
  )

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id)
  })
}