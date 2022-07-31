const db = require("../util/database");

module.exports = class Cart {
  constructor(userId) {
    this.userId = userId;
  }

  static async createCart(userId) {
    const [cart] = await db.execute("SELECT * FROM carts WHERE id = ?", [1]);
    console.log(cart);
    if (cart.length === 0) {
      await db.execute("INSERT INTO carts (userId) VALUES (?)", [userId]);
    }
  }
};
