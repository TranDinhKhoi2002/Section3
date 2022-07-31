const db = require("../util/database");
const Product = require("./product");

module.exports = class CartItem {
  constructor(cartId, productId) {
    this.cartId = cartId;
    this.productId = productId;
    this.quantity = 1;
  }

  async addToCart() {
    const [items] = await db.execute(
      "SELECT * FROM cart_items WHERE productId = ?",
      [this.productId]
    );

    if (items.length === 0) {
      await db.execute(
        "INSERT INTO cart_items (cartId, productId, quantity) VALUES (?, ?, ?)",
        [this.cartId, this.productId, this.quantity]
      );
    } else {
      const updatedQuantity = items[0].quantity + 1;
      await db.execute(
        "UPDATE cart_items SET quantity = ? WHERE productId = ?",
        [updatedQuantity, this.productId]
      );
    }
  }

  static async fetchProducts() {
    const [products, fieldData] = await Product.fetchAll();
    const [ids] = await db.execute("SELECT productId FROM cart_items");
    const cartItemIds = ids.map((item) => item.productId);

    const cartProducts = [];

    for (const product of products) {
      if (cartItemIds.includes(product.id)) {
        const [item] = await db.execute(
          "SELECT quantity FROM cart_items WHERE productId = ?",
          [product.id]
        );

        const productQuantity = item[0].quantity;
        cartProducts.push({ ...product, quantity: productQuantity });
      }
    }

    console.log(cartProducts);

    return cartProducts;
  }

  static async deleteById(productId) {
    await db.execute("DELETE FROM cart_items WHERE productId = ?", [productId]);
  }

  static async removeFromCart(productId) {
    await db.execute("DELETE FROM cart_items WHERE productId = ?", [productId]);
  }
};
