import express from "express";
import productRoute from "./product.route.js";
import reviewRoute from "./review.route.js";

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
];

defaultRoutes.forEach((each) => {
  router.use(each.path, each.route);
});

export default router;
