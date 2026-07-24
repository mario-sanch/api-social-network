import express from "express";
const userRouter = express.Router();
import { auth } from "../middleware/auth.js";

import {
  users,
  register,
  login,
  profile,
  list,
} from "../controllers/userController.js";

userRouter.get("/users", auth, users);

userRouter.post("/users", register);

userRouter.post("/users/login", login);

userRouter.get("/users/profile/:id", auth, profile);

userRouter.get("/users/list", auth, list);

export { userRouter };
