const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = async function (product) {
  const updatedCartItems = [...this.cart.items];

  const cartProductIndex = this.cart.items.findIndex(
    (item) => item.productId.toString() === product._id.toString()
  );

  if (cartProductIndex >= 0) {
    updatedCartItems[cartProductIndex].quantity =
      this.cart.items[cartProductIndex].quantity + 1;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: 1,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };

  this.cart = updatedCart;
  await this.save();
};

userSchema.methods.removeFromCart = async function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  await this.save();
};

userSchema.methods.clearCart = async function () {
  this.cart.items = [];
  await this.save();
};

module.exports = mongoose.model("User", userSchema);
