import jwt from "jwt-simple";
import moment from "moment";

const secret = "clavesecreta123456789";

const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    nick: user.nick,
    role: user.role,
    image: user.image,
    createdAt: user.createdAt,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  return jwt.encode(payload, secret);
};

export { createToken, secret };
