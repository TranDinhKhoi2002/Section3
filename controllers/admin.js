const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: `/admin/add-product`,
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postAddProduct = async (req, res, next) => {
  try {
    const { title, imageUrl, price, description } = req.body;
    console.log(req.session);
    const product = new Product({
      title,
      price,
      description,
      imageUrl,
      userId: req.session.user._id,
    });
    await product.save();

    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
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
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: `/admin/edit-product`,
      editing: editMode,
      product: product,
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
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
    const product = await Product.findById(productId);
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDescription;
    product.imageUrl = updatedUrl;

    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const productId = req.body.productId;

  try {
    // findByIdAndRemove returns the document while findByIdAndDelete doesn't.
    await Product.deleteOne({ _id: productId });
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.log(err);
  }
};
