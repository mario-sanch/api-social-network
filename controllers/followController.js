import { FollowModel } from "../models/followModel.js";
import { userModel } from "../models/userModel.js";

const follow = async (req, res) => {
  try {
    const user = req.user;
    const { followed } = req.body;

    const followedUser = await userModel.findById(followed);

    if (!followedUser) {
      return res.status(404).json({
        status: "error",
        msg: "User with provided id does not exists",
      });
    }

    if (String(user.id) === String(followed)) {
      return res.status(400).json({
        status: "bad request",
        msg: "An user can not follow himself",
      });
    }

    const userFound = await FollowModel.findOne({ user: user.id, followed });

    if (!userFound) {
      return res.status(400).json({
        status: "error",
        msg: "Already following",
      });
    }

    await FollowModel.create({ user: user.id, followed });

    return res.status(200).json({
      status: "success",
      msg: "New registry successfully saved",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      msg: "Follow could not be saved",
      err,
    });
  }
};

const remove = async (req, res) => {
  try {
    const user = req.user;

    const { followedId } = req.params;

    const deleted = await FollowModel.findOneAndDelete({
      user: user.id,
      followed: followedId,
    });

    if (!deleted) {
      return res.status(404).json({
        status: "success",
        msg: "Follow not found",
      });
    }

    return res.status(200).json({
      status: "success",
      msg: "Follow deleted successfully",
      user,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      status: "error",
      msg: "error deleting follow",
    });
  }
};

// listado de usuarios q sigo

// listado de usuarios q me siguen

export { follow, remove };
