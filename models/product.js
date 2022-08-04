const { ObjectId } = require("mongodb");
const { getDb } = require("../util/database");

const Product = class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new ObjectId(id) : null;
    this.userId = userId;
  }

  async save() {
    const db = getDb();

    if (!this._id) {
      this._id = new ObjectId();
    }
    await db
      .collection("products")
      .updateOne({ _id: this._id }, { $set: this }, { upsert: true });
  }

  static async fetchAll() {
    const db = getDb();
    const products = await db.collection("products").find().toArray();
    return products;
  }

  static async findById(productId) {
    const db = getDb();
    const product = await db
      .collection("products")
      .find({ _id: new ObjectId(productId) })
      .next();
    return product;
  }

  static async deleteById(productId) {
    const db = getDb();
    await db.collection("products").deleteOne({ _id: new ObjectId(productId) });
  }
};

module.exports = Product;
