import express from "express";
import sellerProductRoute from "./sellerProduct.route.js";
import reviewRoute from "./review.route.js";
import sellerRoute from "./seller.route.js";
import authRoute from "./auth.route.js";
import productRoute from "./product.route.js";
import notificationRoute from "./notification.route.js";
import adminRoute from "./admin.route.js";
import postRoute from "./post.route.js";
import commentRoute from "./comment.route.js";
import orderRoute from "./order.route.js";

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
    path: "/community",
    route: postRoute,
  },
  {
    path: "/comments",
    route: commentRoute,
  },
  {
    path: "/products",
    route: productRoute,
  },
  {
    path: "/notification",
    route: notificationRoute,
  },
  {
    path: "/admin",
    route: adminRoute,
  },
  {
    path: "/orders",
    route: orderRoute,
  },
];

defaultRoutes.forEach((each) => {
  router.use(each.path, each.route);
});

export default router;
