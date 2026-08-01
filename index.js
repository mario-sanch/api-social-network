import express from "express";
import cors from "cors";
import { connection } from "./database/connection.js";
import { swaggerUi, specs } from "./config/swagger.js";

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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api", userRouter);

// listen http requests
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
