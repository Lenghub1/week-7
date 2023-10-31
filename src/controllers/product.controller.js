import service from "../services/product.service.js";
import factory from "./factory.js";

const productController = {
  createProduct: factory.create(service.createProduct),
  getProduct: factory.getById(service.getProduct),
  updateProduct: factory.updateById(service.updateProduct),
  deleteProduct: factory.deleteById(service.deleteProduct),
  getAllProducts: factory.getAll(service.getAllProducts),
};

export default productController;
