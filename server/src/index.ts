import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./sockets/index";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
  transports: ["websocket"],
});


app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());
app.use("/api/auth", authRouter);



mongoose.connect(process.env.MONGO_URI as string);

registerSocketHandlers(io);

server.listen(5000);
