const db = require("../util/database");

module.exports = class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  static async createUser() {
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [1]);

    if (users.length === 0) {
      await db.execute("INSERT INTO users (name, email) VALUES (?, ?)", [
        "trandinhkhoi",
        "khoi@gmail.com",
      ]);
    }
  }
};
