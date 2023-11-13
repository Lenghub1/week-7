/**
 * @file product.service.js
 * @description This module provides functions to interact with product data in the application. It includes methods for creating, retrieving, updating, and deleting products.
 */

import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";

/**
 * @typedef {Object} ProductInput
 * @property {string} title - The title of the product.
 * ß@property {string} description - The description of the product.
 * @property {number} unitPrice - The price of the product.
 * @property {number} unit - The unit of the product.
 */

/**
 * @namespace userService
 */

const userService = {
  /**
   * Get a list of all products.
   * @returns {Promise} A promise that resolves with an array of products or rejects with an error if no products are found.
   */
  async getAllUser() {
    const users = await User.find();
    if (users.length === 0) {
      throw new APIError({
        status: 404,
        message: "There is no document found.",
        errors,
      });
    }
    return users;
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
        errors,
      });
    }
    return product;
  },

  /**
   * Create a new product with the provided input.
   * @param {ProductInput} productInput - The product input data.
   * @returns {Promise} A promise that resolves when the product is successfully created.
   */
  async createProduct(productInput) {
    const newProduct = new Product(productInput);
    await newProduct.save();
    if (!newProduct) {
      throw new APIError({
        status: 400,
        message: "Cannot Create New Document",
        errors,
      });
    }
    return newProduct;
  },

  /**
   * Delete a product by its ID.
   * @param {string} productId - The ID of the product to delete.
   * @returns {Promise} A promise that resolves with the deleted product or rejects with an error if not found.
   */
  async deleteProduct(productId) {
    const product = await Product.findByIdAndRemove(productId);
    console.log(product);
    if (!product) {
      throw new APIError({
        status: 404,
        message: "There is no document found with this ID.",
        errors,
      });
    }
    return product;
  },

  /**
   * Update a product with the provided input by its ID.
   * @param {string} productId - The ID of the product to update.
   * @param {ProductInput} productInput - The updated product data.
   * @returns {Promise} A promise that resolves with the updated product or rejects with an error if not found.
   */
  async updateProduct(productId, productInput) {
    const product = await Product.findByIdAndUpdate(productId, productInput, {
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
};

export default userService;
