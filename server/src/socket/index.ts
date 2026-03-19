import { Server } from "socket.io"
import { Server as HttpServer } from "http"
import { registerSocketHandlers } from "./socket.handlers"

export let io: Server

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN,
      credentials: true
    }
  })

  io.on("connection", (socket) => {
    registerSocketHandlers(io, socket)
  })
}