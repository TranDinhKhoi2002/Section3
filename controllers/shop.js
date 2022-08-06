const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      isAuthenticated: req.session.isLoggedIn,
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
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await req.session.user.populate("cart.items.productId");
    const products = user.cart.items;

    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products,
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    const product = await Product.findById(productId);
    await req.session.user.addToCart(product);

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteCartItem = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    await req.session.user.removeFromCart(productId);
    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "user._id": req.session.user._id });
    res.render("shop/orders", {
      pageTitle: "Your Orders",
      path: "/orders",
      orders: orders,
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    const user = await req.session.user.populate("cart.items.productId");
    const products = user.cart.items.map((item) => {
      return { quantity: item.quantity, product: { ...item.productId._doc } };
    });

    const order = new Order({
      products,
      user: {
        name: req.session.user.name,
        userId: req.session.user,
      },
    });
    await order.save();
    await req.session.user.clearCart();

    res.redirect("/orders");
  } catch (err) {
    console.log(err);
  }
};
