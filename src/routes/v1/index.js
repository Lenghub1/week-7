import express from "express";
import productRoute from "./product.route.js";
import authRoute from "./auth.route.js";
import userRoute from "./user.route.js";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/products",
    route: productRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/user",
    route: userRoute,
  },
];

defaultRoutes.forEach((each) => {
  router.use(each.path, each.route);
});

export default router;
