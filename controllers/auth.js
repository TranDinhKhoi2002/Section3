const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

exports.postLogin = async (req, res, next) => {
  try {
    const user = await User.findById("62e8ba7ab85fad525b26a300");
    req.session.user = user;
    req.session.isLoggedIn = true;
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
};
