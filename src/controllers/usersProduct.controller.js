import service from "../services/product.service.js";
import factory from "./factory.js";

const usersProductController = {
  getAllProducts: factory.getAll(service.getAllProducts),
  getNewProducts: factory.getAll(service.getNewProducts),
  getTopProducts: factory.getAll(service.getTopProducts),
};

export default usersProductController;
