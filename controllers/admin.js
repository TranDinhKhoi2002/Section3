const CartItem = require("../models/cartItems");
const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: `/admin/add-product`,
    editing: false,
  });
};

exports.postAddProduct = async (req, res, next) => {
  try {
    const { title, imageUrl, price, description } = req.body;

    const product = new Product(title, price, description, imageUrl);
    const result = await product.save();
    console.log(result);
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
    const [product] = await Product.findById(productId);
    if (!product[0]) {
      return res.redirect("/");
    }

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: `/admin/edit-product`,
      editing: editMode,
      product: product[0],
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
    // const product = await Product.findById(productId);
    // product.title = updatedTitle;
    // product.price = updatedPrice;
    // product.description = updatedDescription;
    // product.imageUrl = updatedUrl;
    // await product.save();
    await Product.updateProduct(
      productId,
      updatedTitle,
      updatedPrice,
      updatedUrl,
      updatedDescription
    );
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }

  // Using Sequelize

  // Product.findByPk(productId)
  //   .then((product) => {
  //     product.title = updatedTitle;
  //     product.price = updatedPrice;
  //     product.imageUrl = updatedUrl;
  //     product.description = updatedDescription;
  //     return product.save();
  //   })
  //   .then((result) => {
  //     console.log(result);
  //     res.redirect("/admin/products");
  //   })
  //   .catch((err) => console.log(err));

  // OR

  // Product.update(
  //   {
  //     title: updatedTitle,
  //     price: updatedPrice,
  //     imageUrl: updatedUrl,
  //     description: updatedDescription,
  //   },
  //   { where: { id: productId } }
  // )
  //   .then((result) => {
  //     // result shows that how many elements are affected
  //     console.log(result);
  //     res.redirect("/admin/products");
  //   })
  //   .catch((err) => console.log(err));
};

exports.postDeleteProduct = async (req, res, next) => {
  const productId = req.body.productId;

  try {
    // findByIdAndRemove returns the document while findByIdAndDelete doesn't.
    await Product.deleteById(productId);
    await CartItem.deleteById(productId);
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
  // Product.findByPk(productId)
  //   .then((product) => {
  //     return product.destroy();
  //   })
  //   .then(() => {
  //     console.log("DESTROYED PRODUCT");
  //     res.redirect("/admin/products");
  //   })
  //   .catch((err) => console.log(err));

  // OR

  // Product.destroy({ where: { id: productId } })
  //   .then(() => {
  //     console.log("DESTROYED PRODUCT");
  //     res.redirect("/admin/products");
  //   })
  //   .catch((err) => console.log(err));
};

exports.getProducts = async (req, res, next) => {
  try {
    const [rows, fieldData] = await Product.fetchAll();
    // .select("title price -_id")
    // .populate("userId", "name");

    res.render("admin/products", {
      prods: rows,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (err) {
    console.log(err);
  }
};
