const { validationResult } = require("express-validator");
const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: `/admin/add-product`,
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = async (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        path: `/admin/add-product`,
        editing: false,
        hasError: true,
        errorMessage: errors.array()[0].msg,
        product: { title, imageUrl, price, description },
        validationErrors: errors.array(),
      });
    }

    const product = new Product({
      title,
      price,
      description,
      imageUrl,
      userId: req.user,
    });
    await product.save();

    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error("Creating a product failed, please try again!");
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.redirect("/admin/products");
    }

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: `/admin/edit-product`,
      editing: editMode,
      hasError: false,
      product: product,
      errorMessage: null,
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error("Something went wrong, please try again!");
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const {
    productId,
    title: updatedTitle,
    imageUrl: updatedUrl,
    price: updatedPrice,
    description: updatedDescription,
  } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: `/admin/edit-product`,
        editing: true,
        hasError: true,
        product: {
          title: updatedTitle,
          price: updatedPrice,
          imageUrl: updatedUrl,
          description: updatedDescription,
          _id: productId,
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    const product = await Product.findById(productId);
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }

    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDescription;
    product.imageUrl = updatedUrl;

    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error("Editing a product failed, please try again!");
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const productId = req.body.productId;

  try {
    // findByIdAndRemove returns the document while findByIdAndDelete doesn't.
    await Product.deleteOne({ _id: productId, userId: req.user._id });
    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error("Deleting a product failed, please try again!");
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (err) {
    const error = new Error("Something went wrong, please try again!");
    error.httpStatusCode = 500;
    return next(error);
  }
};
