const db = require("../util/database");

module.exports = class Product {
  constructor(title, price, description, imageUrl) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  async save() {
    await db.execute(
      "INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)",
      [this.title, this.price, this.imageUrl, this.description]
    );
  }

  static async deleteById(productId) {
    await db.execute("DELETE FROM products WHERE id = ?", [productId]);
  }

  static async fetchAll() {
    return await db.execute("SELECT * FROM products");
  }

  static async findById(productId) {
    return await db.execute("SELECT * FROM products WHERE products.id = ?", [
      productId,
    ]);
  }

  static async updateProduct(productId, title, price, imageUrl, description) {
    await db.execute(
      "UPDATE products SET title = ?, price = ?, imageUrl = ?, description = ? WHERE id = ?",
      [title, price, imageUrl, description, productId]
    );
  }
};
