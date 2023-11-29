import service from "../services/product.service.js";
import factory from "./factory.js";

const productController = {
  getAllProducts: factory.getAll(service.getAllProducts),
  getProduct: factory.getById(service.getProduct),
};

export default productController;
