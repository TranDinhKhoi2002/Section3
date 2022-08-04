const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const errorController = require("./controllers/404");

const mongoose = require("mongoose");
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(async (req, res, next) => {
  const user = await User.findById("62e8ba7ab85fad525b26a300");
  req.user = user;
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://nodejscourse:tLUZcLfbE01uJY1M@cluster0.9srxm.mongodb.net/bookshop_review?retryWrites=true&w=majority"
  )
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "khoi",
          email: "khoi@khoi123.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch((err) => console.log(err));
