import express from "express";
import productRoute from "./product.route.js";
import reviewRoute from "./review.route.js";
import sellerRoute from "./seller.route.js";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/products",
    route: productRoute,
  },
  {
    path: "/reviews",
    route: reviewRoute,
  },
  {
    path: "/seller",
    route: sellerRoute,
  },
];

defaultRoutes.forEach((each) => {
  router.use(each.path, each.route);
});

export default router;
