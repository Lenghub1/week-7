/**
 * @file product.service.js
 * @description This module provides functions to interact with product data in the application. It includes methods for creating, retrieving, updating, and deleting products.
 */

import Product from "../models/product.model.js";
import APIError from "../utils/APIError.js";
import APIFeatures from "../utils/APIFeatures.js";
import utils from "../utils/utils.js";

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
  async getAllProducts(queryStr) {
    const features = new APIFeatures(Product, queryStr)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    let products = await features.execute();
    products = products[0];

    if (products.length === 0) {
      throw new APIError({
        status: 404,
        message: "There is no document found.",
      });
    }
    return products;
  },

  /**
   * Get a list of all products of a seller.
   * @param {ReqQueryObj} queryStr
   * @returns {Promise} A promise that resolves with an object of products and pagination or rejects with an error if no products are found.
   */

  async getOwnProducts(queryStr) {
    if (queryStr.categories)
      queryStr.categories = queryStr.categories.split(",");
    const features = new APIFeatures(Product, queryStr)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    let products = await features.execute();
    products = products[0];

    if (!products)
      throw new APIError({
        status: 404,
        message: "There is no document found.",
      });

    products.metadata = utils.getPaginateMetadata(products.metadata, queryStr);

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
    if (!product) {
      throw new APIError({
        status: 404,
        message: "There is no document found with this ID.",
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
      });
    }
    return product;
  },

  async getNewProducts() {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    // Find products created in the last 10 days
    const products = await Product.find({
      createdAt: { $gte: tenDaysAgo }, // Filter products created in the last 10 days
    });
    return products;
  },

  async getTopProducts() {
    const topProducts = await Product.find({
      $or: [
        // Filter products with rating greater or equal 4
        { averageRating: { $gte: 4 } },
        // Filter products with sold greater or equal 100
        { soldAmount: { $gte: 100 } },
      ],
    });
    return topProducts;
  },
};

export default productService;
