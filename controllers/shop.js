const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getProductDetails = async (req, res, next) => {
  const productId = req.params.productId;
  const product = await Product.findById(productId);

  res.render("shop/product-detail", {
    pageTitle: product.title,
    path: "/products",
    product: product,
  });
};

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items;

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
    const product = await Product.findById(productId);
    await req.user.addToCart(product);

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteCartItem = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    await req.user.removeFromCart(productId);
    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "user._id": req.user._id });
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
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items.map((item) => {
      return { quantity: item.quantity, product: { ...item.productId._doc } };
    });

    const order = new Order({
      products,
      user: {
        email: req.user.email,
        userId: req.user,
      },
    });
    await order.save();
    await req.user.clearCart();

    res.redirect("/orders");
  } catch (err) {
    console.log(err);
  }
};
