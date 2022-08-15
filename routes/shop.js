const express = require("express");

const shopController = require("../controllers/shop");
const protectRoutes = require("../middleware/protect-routes");

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProductDetails);

router.get("/cart", protectRoutes, shopController.getCart);

router.post("/cart", protectRoutes, shopController.postCart);

router.post(
  "/cart-delete-item",
  protectRoutes,
  shopController.postDeleteCartItem
);

router.get("/orders", protectRoutes, shopController.getOrders);

router.get("/orders/:orderId", protectRoutes, shopController.getInvoice);

router.post("/create-order", protectRoutes, shopController.postOrder);

module.exports = router;
