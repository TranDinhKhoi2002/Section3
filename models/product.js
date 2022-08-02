const { ObjectId } = require("mongodb");
const { getDb } = require("../util/database");

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new ObjectId(id) : null;
    this.userId = userId;
  }

  async save() {
    try {
      const db = getDb();
      if (!this._id) {
        this._id = new ObjectId();
      }
      await db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this }, { upsert: true });
    } catch (err) {
      console.log(err);
    }
  }

  static async fetchAll() {
    try {
      const db = getDb();
      const products = await db.collection("products").find().toArray();
      return products;
    } catch (err) {
      console.log(err);
    }
  }

  static async findById(productId) {
    try {
      const db = getDb();
      const product = await db
        .collection("products")
        .find({ _id: new ObjectId(productId) })
        .next();

      return product;
    } catch (err) {
      console.log(err);
    }
  }

  static async deleteById(productId, user) {
    try {
      const db = getDb();
      await db
        .collection("products")
        .deleteOne({ _id: new ObjectId(productId) });

      const updatedCart = {
        items: user.cart.items.filter(
          (item) => item.productId.toString() !== productId.toString()
        ),
      };

      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(user._id) },
          { $set: { cart: updatedCart } }
        );
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = Product;
