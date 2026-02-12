import { Schema, model } from "mongoose";

interface User {
  username: string;
  password: string;
}

const UserSchema = new Schema<User>(
  {
    username: { type: String,required: true, unique: true },
    password: { type: String, required: true  },
  },
  { timestamps: true }
);

export const UserModel = model("User", UserSchema);
