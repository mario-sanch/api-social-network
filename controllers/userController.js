import { userModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { createToken } from "../services/jwt.js";

const users = async (req, res) => {
  const usersFromDb = await userModel.find({});
  return res.status(200).json(usersFromDb);
};

const register = async (req, res) => {
  try {
    const params = req.body;

    if (!params.name || !params.lastName || !params.email) {
      return res.status(400).json({ msg: "wrong request, missing data!" });
    }

    const dbObj = await userModel.find({ email: params.email }).exec();

    if (dbObj && dbObj.length >= 1) {
      return res.status(200).json({
        msg: "email already exists!",
        _id: -1,
      });
    }

    const pwd = bcrypt.hashSync(params.password, 10);
    params.password = pwd;

    const userToSave = new userModel(params);

    const newUser = await userToSave.save();

    return res.status(200).json({
      data: newUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userFound = await userModel.findOne({ email: email }).exec();

    if (!userFound) {
      return res
        .status(401)
        .json({ msg: `User not found with login: ${email}` });
    }

    const match = await bcrypt.compare(password, userFound.password);

    if (!match) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const token = createToken(userFound);

    return res.status(200).json({
      msg: "Logged in Successfully!",
      user: {
        _id: userFound._id,
        name: userFound.name,
        lastName: userFound.lastName,
        email: userFound.email,
        nick: userFound.nick,
        role: userFound.role,
        image: userFound.image,
        createdAt: userFound.createdAt,
      },
      token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err });
  }
};

const profile = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await userModel
      .findById(id)
      .select({ password: 0, role: 0 })
      .exec();

    return res.status(200).json({ status: "Success", user });
  } catch (err) {
    return res
      .status(500)
      .json({ status: "error", msg: "An error has ocurred! :(" });
  }
};

const list = async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    if (page <= 0) page = 1;

    const limitUsersPerPage = Number(req.query.limit) || 10;
    if (limitUsersPerPage < 0 || limitUsersPerPage > 10) limitUsersPerPage = 10;

    const { search, sortBy, order } = req.query;

    const offset = (page - 1) * limitUsersPerPage;

    let queryFilter = {};

    if (search) {
      queryFilter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    let sortOptions = {};

    if (sortBy) {
      const sortOrder = order === "desc" ? -1 : 1;
      sortOptions[sortBy] = sortOrder;
    } else {
      sortOptions = { createdAt: -1 };
    }

    const [totalUsers, users] = await Promise.all([
      userModel.countDocuments(queryFilter),
      userModel
        .find(queryFilter)
        .select("-password")
        .sort(sortOptions)
        .skip(offset)
        .limit(limitUsersPerPage)
        .lean(),
    ]);

    return res.status(200).json({
      status: "Success",
      users,
      pagination: {
        currentPage: page,
        usersPerPage: limitUsersPerPage,
        totalPages: Math.ceil(totalUsers / limitUsersPerPage),
      },
      appliedFilters: {
        search: search || null,
        sortBy: sortBy || "createdAt",
        order: order || "desc",
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err });
  }
};

export { users, register, login, profile, list };
