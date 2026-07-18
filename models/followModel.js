import { Schema, model } from "mongoose";

const followSchema = Schema({
  user: {
    type: String,
    required: true,
  },
  followed: {
    type: String,
    required: true,
  },
});
