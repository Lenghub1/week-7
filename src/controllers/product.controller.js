import service from "../services/product.service.js";
import factory from "./factory.js";

const productController = {
  createProduct: factory.createOne(service.createProduct),
  getProduct: factory.getById(service.getProduct),
  getAllProducts: factory.getAll(service.getAllProducts),
  updateProduct: factory.updateOne(service.updateProduct),
  deleteProduct: factory.deleteOne(service.deleteProduct),
};

export default productController;
