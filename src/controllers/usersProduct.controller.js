import service from "../services/product.service.js";
import factory from "./factory.js";

const usersProductController = {
  getAllProducts: factory.getAll(service.getAllProducts),
  getNewProducts: factory.getAll(service.getNewProducts),
};

export default usersProductController;
