import { Socket } from "socket.io"

export function registerSocketHandlers(socket: Socket) {

  console.log("user connected", socket.id)

  socket.on("join_conversation", (conversationId: string) => {
    socket.join(conversationId)
  })

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id)
  })

}