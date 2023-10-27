import service from "../services/product.service.js";
import factory from "./factory.js";

const productController = {
  createProduct: factory.createOne(service.createProduct),
  // getAllProducts: factory.getAll(service.)
};

export default productController;
