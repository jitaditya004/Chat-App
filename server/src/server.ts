import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { initSocket } from "./socket"

import { connectDB } from "./config/db";
import authRouter from "./modules/auth/auth.routes";
import userRouter from "./modules/users/users.routes";
import conversationRouter from "./modules/conversations/conversation.routes";
import messageRouter from "./modules/messages/message.routes";


dotenv.config();

const app = express();
const server = http.createServer(app);

initSocket(server)



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
app.use("/api/conversations", conversationRouter);
app.use("/api/messages", messageRouter);


async function start() {
  await connectDB();

  server.listen(5000, () => {
    console.log("Server running on 5000");
  });
}

start();