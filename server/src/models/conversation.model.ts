import { Schema, model, Types } from "mongoose";

const ConversationSchema = new Schema(
  {
    participants: [
      { type: Types.ObjectId, ref: "User", required: true }
    ],

    lastMessage: {
      type: String
    },

    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export const ConversationModel = model(
  "Conversation",
  ConversationSchema
);