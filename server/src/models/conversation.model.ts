import { Schema, model, Types } from "mongoose";

const conversationSchema = new Schema(
  {
    participants: [
      { type: Types.ObjectId, ref: "User", required: true }
    ],
    lastMessage: { type: String },
  },
  { timestamps: true }
);

export const ConversationModel = model(
  "Conversation",
  conversationSchema
);
