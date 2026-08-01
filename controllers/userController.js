import { userModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { createToken } from "../services/jwt.js";
import fs from "fs/promises";
import path from "path";

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

const update = async (req, res) => {
  try {
    let userSession = req.user;
    let userNewData = req.body;

    delete userSession.iat;
    delete userSession.exp;
    delete userSession.role;
    delete userSession.createdAt;

    const usersFromDb = await userModel.find({
      email: userNewData.email.toLowerCase(),
    });

    if (usersFromDb && usersFromDb.length >= 1) {
      usersFromDb.map((u) => {
        if (!u._id.equals(userSession.id)) {
          return res.status(200).json({
            status: "Success",
            msg: "User with same email already exists",
            u,
          });
        }
      });
    }

    if (userNewData.password) {
      let passwordHashed = await bcrypt.hash(userNewData.password, 10);

      userNewData.password = passwordHashed;
    }

    const userUpdated = await userModel.findByIdAndUpdate(
      userSession.id,
      userNewData,
      { new: true }
    );

    // should I update token? now the user stored in token is outdated

    return res.status(200).json({
      status: "Succes",
      msg: "testing method update from userController",
      user: userUpdated,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "Error",
      msg: "Error updating user",
    });
  }
};

const uploadImg = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(404).json({
        status: "error",
        msg: "Request lacks image",
      });
    }

    const imgName = req.file.originalname;
    const imageNameSplited = imgName.split(".");
    const imgExtension = imageNameSplited[1];

    const allowedExtensions = ["png", "jpg", "jpeg", "gif"];

    if (!allowedExtensions.includes(imgExtension)) {
      const filePath = req.file.path;

      await fs.unlink(filePath);

      return res.status(400).json({
        status: "error",
        msg: "extension is invalid!",
      });
    }

    const userUpdated = await userModel.findOneAndUpdate(
      { _id: req.user.id },
      { image: req.file.filename },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      file: req.file,
      userUpdated: userUpdated,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      msg: "Error uploading image",
    });
  }
};

const avatar = async (req, res) => {
  try {
    const { file } = req.params;

    const fileName = path.basename(file);
    const filePath = `./uploads/avatars/${fileName}`;

    await fs.access(filePath);

    return res.status(200).json({
      status: "success",
      msg: "hi from avatar",
      file: fileName,
      filePath,
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      return res.status(404).json({
        status: "error",
        msg: "file not found",
      });
    }
    return res.status(500).json({
      status: "error",
      msg: "error getting avatar",
    });
  }
};

export { register, login, profile, list, update, uploadImg, avatar };
