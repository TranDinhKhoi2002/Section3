const db = require("../util/database");

module.exports = class OrderItem {
  constructor(orderId, productId, quantity) {
    this.orderId = orderId;
    this.productId = productId;
    this.quantity = quantity;
  }

  async save() {
    await db.execute(
      "INSERT INTO order_items (orderId, productId, quantity) VALUES (?, ?, ?)",
      [this.orderId, this.productId, this.quantity]
    );
  }

  static async fetchOrders() {
    const [orders] = await db.execute("SELECT * FROM order_items");
    return orders;
  }
};
