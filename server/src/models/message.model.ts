import { Schema, model, Types } from "mongoose";

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Types.ObjectId,
      required: true,
      index: true
    },
    senderId: {
      type: Types.ObjectId,
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const MessageModel = model(
  "Message",
  MessageSchema
);