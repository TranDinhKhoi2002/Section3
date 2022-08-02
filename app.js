const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/404");

const app = express();

const connectToMongo = require("./util/database").connectToMongo;
const User = require("./models/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");

const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");

app.use(async (req, res, next) => {
  try {
    const user = await User.findById("62e8ba7ab85fad525b26a300");
    req.user = new User(user.name, user.email, user.cart, user._id);
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

connectToMongo(() => {
  app.listen(3000);
});
