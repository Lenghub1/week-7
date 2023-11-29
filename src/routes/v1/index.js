import express from "express";
import productRoute from "./product.route.js";
import reviewRoute from "./review.route.js";
import sellerRoute from "./seller.route.js";
import authRoute from "./auth.route.js";

import postRoute from "./post.route.js";
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
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/seller",
    route: sellerRoute,
  },
  {
    path: "/community",
    route: postRoute,
  },
];

defaultRoutes.forEach((each) => {
  router.use(each.path, each.route);
});

export default router;
