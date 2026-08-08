import express from "express";
import { auth } from "../middleware/auth.js";
import { follow, remove } from "../controllers/followController.js";
import {
  followRegistrationRules,
  validateFollowRegistrationResult,
} from "../middleware/followValidator.js";

const followRouter = express.Router();

followRouter.post(
  "/follow",
  auth,
  followRegistrationRules,
  validateFollowRegistrationResult,
  follow
);

followRouter.delete("/follow/:followedId", auth, remove);

export { followRouter };
