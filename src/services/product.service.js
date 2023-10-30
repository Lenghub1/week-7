import Product from "../models/product.model.js";
import APIError from "../utils/APIError.js";

const productService = {
  async createProduct(productInput) {
    const newProduct = new Product(productInput);
    await newProduct.save();
  },

  async getProduct(productId) {
    const product = Product.findById(productId);
    if (!product) {
      throw new APIError({
        status: 404,
        message: "There is no document found with this ID.",
        errors,
      });
    }
    return product;
  },

  async updateProduct(productId, productInput) {
    const product = Product.findByIdAndUpdate(productId, productInput, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      throw new APIError({
        status: 404,
        message: "There is no document found with this ID.",
        errors,
      });
    }
    return product;
  },

  async deleteProduct(productId) {
    const product = Product.findByIdAndRemove(productId);
    if (!product) {
      throw new APIError({
        status: 404,
        message: "There is no document found with this ID.",
        errors,
      });
    }
    return product;
  },

  async getAllProducts() {
    const products = await Product.find();
    if (products.length === 0) {
      throw new APIError({
        status: 404,
        message: "There is no document found.",
        errors,
      });
    }
    return products;
  },
};

export default productService;
