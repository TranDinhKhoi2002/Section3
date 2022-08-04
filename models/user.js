const { ObjectId } = require("mongodb");
const { getDb } = require("../util/database");

const User = class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  async save() {
    const db = getDb();
    await db.collection("users").insertOne(this);
  }

  static async findById(userId) {
    const db = getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    return user;
  }

  async getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((item) => item.productId);

    const cartProducts = await db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray();

    const fetchedProducts = cartProducts.map((product) => {
      const quantity = this.cart.items.find(
        (item) => item.productId.toString() === product._id.toString()
      ).quantity;
      return {
        ...product,
        quantity,
      };
    });

    return fetchedProducts;
  }

  async addToCart(product) {
    const db = getDb();
    const updatedCartItems = [...this.cart.items];

    const cartProductIndex = this.cart.items.findIndex(
      (item) => item.productId.toString() === product._id.toString()
    );

    if (cartProductIndex >= 0) {
      updatedCartItems[cartProductIndex].quantity =
        this.cart.items[cartProductIndex].quantity + 1;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: 1,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };

    await db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  async removeFromCart(productId) {
    const db = getDb();
    const updatedCartItems = this.cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    const updatedCart = {
      items: updatedCartItems,
    };

    await db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  async getOrders() {
    const db = getDb();
    const orders = await db
      .collection("orders")
      .find({ "user._id": new ObjectId(this._id) })
      .toArray();
    return orders;
  }

  async addOrder() {
    const db = getDb();
    const cartProducts = await this.getCart();

    const order = {
      products: cartProducts,
      user: {
        _id: this._id,
        name: this.name,
      },
    };
    await db.collection("orders").insertOne(order);

    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: [] } } }
      );
  }
};

module.exports = User;
