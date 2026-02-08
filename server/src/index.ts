import express from "express";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middlewares/error.middleware";

import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db";
import { initSocket } from "./sockets/chat.socket";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.json());

connectDB();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" }
});

initSocket(io);


app.use("/users", userRoutes);

app.use(errorHandler);

const PORT= process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log("Server running on port 3000");
});
