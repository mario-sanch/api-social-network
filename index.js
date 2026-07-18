import express from "express";
import cors from "cors";
import { connection } from "./database/connection.js";
connection();
console.log("API NODE for social network started");

import { userRouter } from "./routes/userRoutes.js";

// server
const app = express();
const port = 3900;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/test", (req, res) => {
  return res.status(200).json({ msg: "Holas! :)" });
});

app.use("/api", userRouter);

// listen http requests
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
