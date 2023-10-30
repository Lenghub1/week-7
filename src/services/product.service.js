import Product from "../models/product.model.js";
import AppError from "../utils/AppError.js";

const productService = {
  async createProduct(productInput) {
    const newProduct = new Product(productInput);
    await newProduct.save();
  },

  async getProduct(productId) {
    const product = Product.findById(productId);
    if (!product) {
      return next(AppError("There is no document found with this ID.", 404));
    }
    return product;
  },

  async updateProduct(productId, productInput) {
    const product = Product.findByIdAndUpdate(productId, productInput, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return next(AppError("There is no document found with this ID.", 404));
    }
    return product;
  },

  async deleteProduct(productId) {
    const product = Product.findByIdAndRemove(productId);
    if (!product) {
      return next(AppError("There is no document found with this ID.", 404));
    }
    return product;
  },

  async getAllProducts() {
    return Product.find();
  },
};

export default productService;
