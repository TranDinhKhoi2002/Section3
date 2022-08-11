const express = require("express");
const router = express.Router();

const { check, body } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);

router.post(
  "/login",
  [body("email").isEmail().withMessage("Invalid email.")],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email exists already, please pick another one"
            );
          }
        });
      }),
    body(
      "password",
      "Please enter a password with numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Your confirm password is incorrect.");
      }
      return true;
    }),
  ],
  authController.postSignup
);

router.get("/reset-password", authController.getResetPassword);

router.post("/reset-password", authController.postResetPassword);

router.get("/reset-password/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
