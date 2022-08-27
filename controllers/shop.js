const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// sk_test_51LXLXjJHSbimnUs13TYHRHzWhg8zplGJStLkmOE1Iuniw875YJFFOEI9zL0l7LRmEdb9vUaUeyCgH2zQabGlStY2000EVwjiJP
const stripe = require("stripe")(process.env.STRIPE_KEY);

const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 2;

exports.getProducts = async (req, res, next) => {
  const page = +req.query.page || 1;

  try {
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    const totalItems = await Product.find().countDocuments();

    res.render("shop/product-list", {
      prods: products,
      pageTitle: "Products",
      path: "/products",
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    const error = new Error("Something went wrong!");
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProductDetails = async (req, res, next) => {
  const productId = req.params.productId;
  const product = await Product.findById(productId);

  console.log(product.imageUrl.replace("\\", "/"));

  res.render("shop/product-detail", {
    pageTitle: product.title,
    path: "/products",
    product: product,
  });
};

exports.getIndex = async (req, res, next) => {
  const page = +req.query.page || 1;

  try {
    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    const totalItems = await Product.find().countDocuments();

    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    const error = new Error("Something went wrong!");
    error.httpStatusCode = 500;
    return next(error);
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
    const error = new Error("Something went wrong!");
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCheckout = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items;
    const totalPrice = products.reduce((total, product) => {
      return total + product.quantity * product.productId.price;
    }, 0);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: products.map((product) => {
        return {
          quantity: product.quantity,
          price_data: {
            currency: "usd",
            unit_amount: product.productId.price * 100,
            product_data: {
              name: product.productId.title,
              description: product.productId.description,
            },
          },
        };
      }),
      customer_email: req.user.email,
      success_url: req.protocol + "://" + req.get("host") + "/checkout/success",
      cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
    });

    res.render("shop/checkout", {
      pageTitle: "Checkout",
      path: "/checkout",
      products: products,
      totalPrice: totalPrice,
      sessionId: session.id,
    });
  } catch (err) {
    console.log(err);
    const error = new Error("Something went wrong!");
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    const product = await Product.findById(productId);
    await req.user.addToCart(product);

    res.redirect("/cart");
  } catch (err) {
    const error = new Error("Something went wrong!");
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postDeleteCartItem = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    await req.user.removeFromCart(productId);
    res.redirect("/cart");
  } catch (err) {
    const error = new Error("Something went wrong!");
    error.httpStatusCode = 500;
    return next(error);
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
    const error = new Error("Something went wrong!");
    error.httpStatusCode = 500;
    return next(error);
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
    const error = new Error("Something went wrong!");
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCheckoutSuccess = async (req, res, next) => {
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
    const error = new Error("Something went wrong!");
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new Error("No order found."));
    }

    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized"));
    }

    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = path.join("data", "invoices", invoiceName);

    const pdfDoc = new PDFDocument({ font: "Times-Roman" });
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=" + invoiceName);

    pdfDoc.fontSize(26).text("Invoice", {
      underline: true,
    });
    pdfDoc.text("----------------------");
    let totalPrice = 0;
    order.products.forEach((prod) => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc
        .fontSize(14)
        .text(
          `${prod.product.title} - ${prod.quantity} x $${prod.product.price}`
        );
    });
    pdfDoc.text("----------------------");
    pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);

    pdfDoc.end();

    // fs.readFile(invoicePath, (err, data) => {
    //   if (err) {
    //     return next(err);
    //   }

    //   res.setHeader("Content-Type", "application/pdf");
    //   res.setHeader("Content-Disposition", "inline; filename=" + invoiceName);
    //   res.send(data);
    // });

    // const file = fs.createReadStream(invoicePath);
    // file.pipe(res);
  } catch (err) {
    if (err.value.length !== 24) {
      err.message = "No order found.";
    }
    next(err);
  }
};
