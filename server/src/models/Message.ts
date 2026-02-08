import { Schema, model } from "mongoose";

interface Message {
  sender: string;
  text: string;
}

const messageSchema = new Schema<Message>(
  {
    sender: { type: String, required: true },
    text: { type: String, required: true }
  },
  { timestamps: true }
);

export const MessageModel = model<Message>("Message", messageSchema);
