const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const adminController = require("../controllers/admin");
const protectRoutes = require("../middleware/protect-routes");

// Routes start with /admin
router.get("/add-product", protectRoutes, adminController.getAddProduct);

router.get("/products", protectRoutes, adminController.getProducts);

router.post(
  "/add-product",
  protectRoutes,
  [
    body("title", "Title has not to be blank")
      .isString()
      .isLength({ min: 1 })
      .trim(),
    body("price", "Price has to be numbers").isFloat(),
    body("description", "Description has not to be blank")
      .isLength({ min: 1 })
      .trim(),
  ],
  adminController.postAddProduct
);

router.get(
  "/edit-product/:productId",
  protectRoutes,
  adminController.getEditProduct
);

router.post(
  "/edit-product",
  protectRoutes,
  [
    body("title", "Title has not to be blank")
      .isString()
      .isLength({ min: 1 })
      .trim(),
    body("price", "Price has to be numbers").isFloat(),
    body("description", "Description has not to be blank")
      .isLength({ min: 1 })
      .trim(),
  ],
  adminController.postEditProduct
);

router.delete(
  "/product/:productId",
  protectRoutes,
  adminController.deleteProduct
);

module.exports = router;
