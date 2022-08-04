const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("bookshop_sequelize", "root", "ngodkdk123", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
