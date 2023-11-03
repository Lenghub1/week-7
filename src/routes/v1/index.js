import express from "express";
import productRoute from "./product.route.js";
import postRoute from "./post.route.js";
import commentRoute from "./comment.route.js";
const router = express.Router();

const defaultRoutes = [
  {
    path: "/products",
    route: productRoute,
  },
  {
    path: "/community",
    route: postRoute,
  },
  {
    path: "/comments",
    route: commentRoute,
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
