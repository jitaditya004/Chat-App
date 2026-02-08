import { Server } from "socket.io";
import { MessageModel } from "../models/Message";

export const initSocket = (io: Server): void => {
  io.on("connection", (socket) => {
    socket.on("send-message", async ({ sender, text }) => {
      const msg = await MessageModel.create({ sender, text });
      io.emit("new-message", msg);
    });
  });
};
