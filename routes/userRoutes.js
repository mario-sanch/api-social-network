import express from "express";
const userRouter = express.Router();

import { users } from "../controllers/userController.js";

userRouter.get("/users", users);

export { userRouter };
