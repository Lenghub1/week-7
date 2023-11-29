import express from "express";
import sellerProductRoute from "./sellerProduct.route.js";
import reviewRoute from "./review.route.js";
import sellerRoute from "./seller.route.js";
import authRoute from "./auth.route.js";
import productRoute from "./product.route.js";
import adminRoute from "./admin.route.js";

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
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/seller",
    route: sellerRoute,
  },
  {
    path: "/products",
    route: productRoute,
  },
  {
    path: "/admin",
    route: adminRoute,
  },
];

defaultRoutes.forEach((each) => {
  router.use(each.path, each.route);
});

export default router;
