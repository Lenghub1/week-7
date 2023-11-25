import express from "express";
import sellerProductRoute from "./sellerProduct.route.js";
import reviewRoute from "./review.route.js";
import product from "./product.route.js";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/seller/products",
    route: sellerProductRoute,
  },
  {
    path: "/reviews",
    route: reviewRoute,
  },
  {
    path: "/products",
    route: product,
  },
];

defaultRoutes.forEach((each) => {
  router.use(each.path, each.route);
});

export default router;
