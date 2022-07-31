const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "bookshop",
  password: "ngodkdk123",
});

module.exports = pool.promise();
