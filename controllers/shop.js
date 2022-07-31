const CartItem = require("../models/cartItems");
const Order = require("../models/order");
const OrderItem = require("../models/orderItems");
const Product = require("../models/product");

exports.getProducts = async (req, res, next) => {
  try {
    const [rows, fieldData] = await Product.fetchAll();
    res.render("shop/product-list", {
      prods: rows,
      pageTitle: "All Products",
      path: "/products",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getProductDetails = async (req, res, next) => {
  const productId = req.params.productId;
  const [product] = await Product.findById(productId);

  res.render("shop/product-detail", {
    pageTitle: product[0].title,
    path: "/products",
    product: product[0],
  });
};

exports.getIndex = async (req, res, next) => {
  try {
    const [rows, fieldData] = await Product.fetchAll();
    res.render("shop/index", {
      prods: rows,
      pageTitle: "Shop",
      path: "/",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const products = await CartItem.fetchProducts();
    // const user = await req.user.populate("cart.items.productId");
    // const products = user.cart.items;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    console.log(productId);
    const cartItem = new CartItem(1, +productId);
    await cartItem.addToCart();

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteCartItem = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    await CartItem.removeFromCart(productId);
    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = [];
    const orderItems = await OrderItem.fetchOrders();

    for (const item of orderItems) {
      const [product] = await Product.findById(item.productId);

      const orderIndex = orders.findIndex(
        (order) => order.orderId === item.orderId
      );
      if (orderIndex >= 0) {
        orders[orderIndex].products.push({
          ...product[0],
          quantity: item.quantity,
        });
      } else {
        if (!item.products) {
          const order = { ...item, products: [] };
          order.products.push({ ...product[0], quantity: item.quantity });
          orders.push(order);
        }
      }
    }

    // const orders = await Order.find({ userId: req.user._id });
    res.render("shop/orders", {
      pageTitle: "Your Orders",
      path: "/orders",
      orders: orders,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    const id = Math.random();
    const order = new Order(id, 1);
    await order.save();

    const cartProducts = await CartItem.fetchProducts();
    for (const product of cartProducts) {
      const orderItem = new OrderItem(id, product.id, product.quantity);
      await orderItem.save();
    }

    for (const product of cartProducts) {
      await CartItem.deleteById(product.id);
    }
    res.redirect("/orders");
  } catch (err) {
    console.log(err);
  }
};
