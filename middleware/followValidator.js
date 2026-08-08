import { body, validationResult } from "express-validator";

const followRegistrationRules = [
  body("followed")
    .trim()
    .notEmpty()
    .withMessage("followed is required")
    .isMongoId()
    .withMessage("followed is not a valid user Id"),
];

const validateFollowRegistrationResult = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      msg: "Bad request",
      errors: errors.array().map((err) => ({
        field: err.path,
        msg: err.msg,
      })),
    });
  }
  next();
};

export { followRegistrationRules, validateFollowRegistrationResult };
