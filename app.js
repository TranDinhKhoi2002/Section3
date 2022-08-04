const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const errorController = require("./controllers/404");

const { connectToMongo } = require("./util/database");
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(async (req, res, next) => {
  const user = await User.findById("62e8ba7ab85fad525b26a300");
  req.user = new User(user.name, user.email, user.cart, user._id);
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

connectToMongo(() => {
  app.listen(3000);
});
