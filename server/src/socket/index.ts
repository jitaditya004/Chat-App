import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
// import * as cookie from "cookie";
import { registerSocketHandlers } from "./socket.handlers";

const cookie = require("cookie");

export let io: Server;

type JwtPayload = {
  userId: string;
};

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN,
      credentials: true,
    },
  });

  // --------------------------------
  // Authenticate every socket
  // connection
  // --------------------------------

  io.use((socket, next) => {
    try {
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        console.error(
          "❌ JWT_SECRET is not configured"
        );

        return next(
          new Error("Authentication service unavailable")
        );
      }

      const rawCookie =
        socket.handshake.headers.cookie;

      if (!rawCookie) {
        console.warn(
          `❌ Socket authentication failed: no cookie [${socket.id}]`
        );

        return next(
          new Error("Unauthorized")
        );
      }

      const cookies = cookie.parseCookie(rawCookie);

      const token = cookies.token;

      if (!token) {
        console.warn(
          `❌ Socket authentication failed: no token [${socket.id}]`
        );

        return next(
          new Error("Unauthorized")
        );
      }

      const decoded = jwt.verify(
        token,
        jwtSecret
      ) as JwtPayload;

      if (!decoded.userId) {
        console.warn(
          `❌ Socket authentication failed: invalid payload [${socket.id}]`
        );

        return next(
          new Error("Unauthorized")
        );
      }

      // Store authenticated user ID
      // so socket handlers can use it
      socket.data.userId = decoded.userId;

      next();
    } catch (error) {
      console.error(
        "❌ Socket authentication error:",
        error
      );

      return next(
        new Error("Unauthorized")
      );
    }
  });

  // --------------------------------
  // Socket connection
  // --------------------------------

  io.on("connection", (socket) => {
    try {
      registerSocketHandlers(io, socket);
    } catch (error) {
      console.error(
        "❌ Failed to register socket handlers:",
        error
      );

      socket.disconnect(true);
    }
  });

  // --------------------------------
  // Server-level error
  // --------------------------------

  io.engine.on("connection_error", (error) => {
    console.error(
      "❌ Socket.IO connection error:",
      {
        message: error.message,
        code: error.code,
        context: error.context,
      }
    );
  });
}