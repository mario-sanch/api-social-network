import { Schema, model } from "mongoose";

const FollowSchema = Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  followed: {
    type: Schema.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FollowModel = model("follow", FollowSchema);

export { FollowModel };
