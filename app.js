const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const sequelize = require("./util/database");
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const errorController = require("./controllers/404");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);
