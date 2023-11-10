import express from "express";
import productRoute from "./product.route.js";
import notificationRoute from "./notification.route.js"
const router = express.Router();

const defaultRoutes = [
  {
    path: "/products",
    route: productRoute,
  },
  {
    path: "/notification",
    route: notificationRoute
  },
  // {
  //   path: "/auth",
  //   route: authRoute
  // }
];

defaultRoutes.forEach((each) => {
  router.use(each.path, each.route);
});

export default router;
