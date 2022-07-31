const db = require("../util/database");

module.exports = class Order {
  constructor(id, userId) {
    this.id = id;
    this.userId = userId;
  }

  async save() {
    await db.execute("INSERT INTO orders (id, userId) VALUE (?, ?)", [
      this.id,
      this.userId,
    ]);
  }
};

// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const orderSchema = new Schema({
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   products: [
//     {
//       product: {
//         type: Object,
//         required: true,
//       },
//       quantity: { type: Number, required: true },
//     },
//   ],
// });

// module.exports = mongoose.model("Order", orderSchema);
