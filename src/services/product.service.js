/**
 * @file product.service.js
 * @description This module provides functions to interact with product data in the application. It includes methods for creating, retrieving, updating, and deleting products.
 */
import Product from "../models/product.model.js";
import APIError from "../utils/APIError.js";

/**
 * @typedef {Object} ProductInput
 * @property {string} title - The title of the product.
 * ß@property {string} description - The description of the product.
 * @property {number} unitPrice - The price of the product.
 * @property {number} unit - The unit of the product.
 */

/**
 * @namespace productService
 */

const productService = {
  /**
   * Get a list of all products.
   * @returns {Promise} A promise that resolves with an array of products or rejects with an error if no products are found.
   */
  async getAllProducts() {
    const products = await Product.find();
    if (products.length === 0) {
      throw new APIError({
        status: 404,
        message: "There is no document found.",
      });
    }
    return products;
  },

  /**
   * Get a product by its ID.
   * @param {string} productId - The ID of the product to retrieve.
   * @returns {Promise} A promise that resolves with the retrieved product or rejects with an error if not found.
   */
  async getProduct(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new APIError({
        status: 404,
        message: "There is no document found with this ID.",
      });
    }
    return product;
  },
};

export default productService;
