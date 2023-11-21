import productService from "../services/product.service.js";
import factory from "./factory.js";

const usersProductController = {
  getAllProducts: factory.getAll(productService.getAllProducts),
};

export default usersProductController;
