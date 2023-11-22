import service from "../services/product.service.js";
import factory from "./factory.js";

const usersProductController = {
  // getAllProducts: factory.getAll(service.getAllProducts),
  getNewProducts: factory.getAll(service.getNewProducts),
  getTopProducts: factory.getAll(service.getTopProducts),
  getByCategories: factory.getAll(service.getProductsByCategories),
};

// getOwnProducts: catchAsync(async (req, res, next) => {
//   const products = await service.getOwnProducts(req.query);

//   return res.json({
//     message: "Data Retrieved",
//     data: products,
//   });
// // })

export default usersProductController;
