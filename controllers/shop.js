const CartItem = require("../models/cartItems");
const Order = require("../models/order");
const OrderItem = require("../models/orderItems");
const Product = require("../models/product");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();
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
  const product = await Product.findByPk(productId);

  res.render("shop/product-detail", {
    pageTitle: product.title,
    path: "/products",
    product: product,
  });
};

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.findAll();
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
    const cart = await req.user.getCart();
    const products = await cart.getProducts();

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

    const cart = await req.user.getCart();
    const products = await cart.getProducts({ where: { id: productId } });

    let product;
    let newQuantity = 1;

    if (products.length > 0) {
      product = products[0];
    }

    if (product) {
      newQuantity = product.cartItem.quantity + 1;
    } else {
      product = await Product.findByPk(productId);
    }

    await cart.addProduct(product, { through: { quantity: newQuantity } });

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteCartItem = async (req, res, next) => {
  try {
    const productId = req.body.productId;

    const cart = await req.user.getCart();
    const products = await cart.getProducts({ where: { id: productId } });

    const product = products[0];
    await product.cartItem.destroy();
    res.redirect("/cart");
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await req.user.getOrders({ include: ["products"] });
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
    const cart = await req.user.getCart();
    const products = await cart.getProducts();

    const order = await req.user.createOrder();
    await order.addProducts(
      products.map((product) => {
        product.orderItem = { quantity: product.cartItem.quantity };
        return product;
      })
    );

    await cart.setProducts(null);
    res.redirect("/orders");
  } catch (err) {
    console.log(err);
  }
};
