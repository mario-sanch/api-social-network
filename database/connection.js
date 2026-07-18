import mongoose from "mongoose";

const connection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/mi_redsocial");

    console.log("Connected to mi_redsocial");
  } catch (err) {
    console.error(err);
    throw new Error("No se ha podido connectar a la base de datos !!");
  }
};

export { connection };
