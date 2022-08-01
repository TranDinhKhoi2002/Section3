const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const OrderItem = sequelize.define("orderItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = OrderItem;
