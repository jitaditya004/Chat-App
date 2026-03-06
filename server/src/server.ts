import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { Server } from "socket.io";

import { connectDB } from "./config/db";
import authRouter from "./modules/auth/auth.routes";
import userRouter from "./modules/users/users.routes";
import { registerSocketHandlers } from "./sockets/socket.handlers";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

registerSocketHandlers(io);

async function start() {
  await connectDB();

  server.listen(5000, () => {
    console.log("Server running on 5000");
  });
}

start();