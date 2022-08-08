const bcrypt = require("bcryptjs");
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
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "No email found.");
      return res.redirect("/login");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      req.flash("error", "Invalid password.");
      return res.redirect("/login");
    }

    req.session.user = user;
    req.session.isLoggedIn = true;
    req.session.save((err) => {
      console.log(err);
      return res.redirect("/");
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
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
    isAuthenticated: false,
    errorMessage: message,
  });
};

exports.postSignup = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  try {
    const userDoc = await User.findOne({ email });
    if (userDoc) {
      req.flash("error", "Your entered email is existing");
      return res.redirect("/signup");
    }

    if (password !== confirmPassword) {
      req.flash("error", "Your confirm password is invalid");
      return res.redirect("/signup");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      cart: { items: [] },
    });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.log(err);
  }
};
