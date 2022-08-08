const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");
const protectRoutes = require("../middleware/protect-routes");

// Routes start with /admin
router.get("/add-product", protectRoutes, adminController.getAddProduct);

router.get("/products", protectRoutes, adminController.getProducts);

router.post("/add-product", protectRoutes, adminController.postAddProduct);

router.get(
  "/edit-product/:productId",
  protectRoutes,
  adminController.getEditProduct
);

router.post("/edit-product", protectRoutes, adminController.postEditProduct);

router.post(
  "/delete-product",
  protectRoutes,
  adminController.postDeleteProduct
);

module.exports = router;
