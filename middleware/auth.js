import jwt from "jwt-simple";
import moment from "moment";
import { secret } from "../services/jwt.js";

const auth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({
      status: "Error",
      message: "The request lacks authentication header",
    });
  }

  let token = req.headers.authorization.replace(/['"]+/g, "");

  try {
    let payload = jwt.decode(token, secret);

    if (payload.exp == null || payload.exp <= moment().unix()) {
      return res.status(404).json({
        status: "error",
        message: "Token expired",
      });
    }

    req.user = payload;

    next();
  } catch (err) {
    return res.status(404).json({
      status: "error",
      msg: "Invalid token",
    });
  }
};

export { auth };
