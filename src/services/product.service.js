import Product from "../models/product.model.js";

const productService = {
  async createProduct(productInput) {
    const newProduct = new Product(productInput);
    await newProduct.save();
  },
};

export default productService;
