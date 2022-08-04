const Product = require("../models/product");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.fetchAll();
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
  console.log(product);

  res.render("shop/product-detail", {
    pageTitle: product.title,
    path: "/products",
    product: product,
  });
};

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.fetchAll();
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
    const products = await req.user.getCart();

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
    const orders = await req.user.getOrders({ include: ["products"] });
    console.log(orders);
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
    await req.user.addOrder();
    res.redirect("/orders");
  } catch (err) {
    console.log(err);
  }
};
