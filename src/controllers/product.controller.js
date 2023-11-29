import service from "../services/product.service.js";
import factory from "./factory.js";

const usersProductController = {
  getUserProducts: factory.getAll(service.getUserProducts),
  getHotProducts: factory.getAll(service.getHotProducts),
  getTopProducts: factory.getAll(service.getTopProducts),
  getByCategories: factory.getAll(service.getProductsByCategories),
};

export default usersProductController;
