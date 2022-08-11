const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const sendgrid = require("@sendgrid/mail");
sendgrid.setApiKey(
  "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"
);

const { validationResult } = require("express-validator");

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: errors.array()[0].msg,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "No email found");
      return res.redirect("/login");
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      req.flash("error", "Incorrect password");
      return res.redirect("/login");
    }

    req.session.user = user;
    req.session.isLoggedIn = true;
    req.session.save((err) => {
      if (err) {
        console.log(err);
      }
      return res.redirect("/");
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
  });
};

exports.postSignup = async (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      cart: { items: [] },
    });
    await user.save();

    sendgrid.send(
      {
        to: email,
        from: "trandinhkhoi102@gmail.com",
        subject: "Signup succeeded!",
        html: "<h1>You successfully signed up!</h1>",
      },
      function (err, infor) {
        if (err) {
          console.log(err);
        } else {
          console.log("Sent");
        }
      }
    );
    res.redirect("/login");
  } catch (err) {
    console.log(err);
  }
};

exports.getResetPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/forget-password", {
    path: "/reset-password",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      req.flash("error", "Something went wrong, please try again!");
      return res.redirect("/reset-password");
    }

    const token = buffer.toString("hex");
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        req.flash("error", "No accounts found with that email");
        return res.redirect("/reset-password");
      }

      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      await user.save();

      sendgrid.send({
        to: req.body.email,
        from: "trandinhkhoi102@gmail.com",
        subject: "Reset Password",
        html: `
          <p>You requested a password reset</p>
          <p>Click this <a href='http://localhost:3000/reset-password/${token}'>link</a> to set a new password</p>
        `,
      });
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  });
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      return res.redirect("/");
    }

    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postNewPassword = async (req, res, next) => {
  const { password: newPassword, passwordToken, userId } = req.body;

  try {
    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });
    const hashedPassword = bcrypt.hashSync(newPassword, 12);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.log(err);
  }
};
