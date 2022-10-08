const { validationResult } = require("express-validator");
const Product = require("../models/product");
const User = require("../models/user");

const fileHelper = require("../util/file");

const ITEMS_PER_PAGE = 2;

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
  const { title, price, description } = req.body;
  const image = req.file;
  console.log(image);
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: `/admin/add-product`,
      editing: false,
      hasError: true,
      errorMessage: "Attached file is not an image",
      validationErrors: [],
      product: { title, price, description },
    });
  }

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        path: `/admin/add-product`,
        editing: false,
        hasError: true,
        errorMessage: errors.array()[0].msg,
        product: { title, price, description },
        validationErrors: errors.array(),
      });
    }

    const imageUrl = image.path;
    console.log(imageUrl);
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
    const error = new Error(
      err.message || "Creating a product failed, please try again!"
    );
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
    price: updatedPrice,
    description: updatedDescription,
  } = req.body;
  const image = req.file;

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
    if (image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }

    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error("Editing a product failed, please try again!");
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.productId;
  const page = +req.query.page || 1;

  try {
    // findByIdAndRemove returns the document while findByIdAndDelete doesn't.
    const product = await Product.findById(productId);
    if (!product) {
      return next(new Error("Product not found."));
    }
    fileHelper.deleteFile(product.imageUrl);

    await Product.deleteOne({ _id: productId, userId: req.user._id });
    const users = await User.find();
    users.forEach((user) => {
      user.removeFromCart(productId);
    });

    res.status(200).json({ message: "Success" });
  } catch (err) {
    res.status(500).json({ message: "Deleting product failed" });
  }
};

exports.getProducts = async (req, res, next) => {
  const page = +req.query.page || 1;
  try {
    const products = await Product.find({ userId: req.user._id })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    const totalItems = await Product.find({
      userId: req.user._id,
    }).countDocuments();

    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    const error = new Error("Something went wrong, please try again!");
    error.httpStatusCode = 500;
    return next(error);
  }
};
