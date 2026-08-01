import { body, validationResult } from "express-validator";

const userRegisterRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must have at least 3 characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last Name is required")
    .isLength({ min: 3 })
    .withMessage("Last Name must have at least 3 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must enter a valid email")
    .normalizeEmail(),

  body("role")
    .optional()
    .isIn(["role_user", "role_admin"])
    .withMessage("Rol is not valid"),
];

const validateResult = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      msg: "Bad Request",
      errors: errors.array().map((err) => ({
        field: err.path,
        msg: err.msg,
      })),
    });
  }

  next();
};

export { userRegisterRules, validateResult };
