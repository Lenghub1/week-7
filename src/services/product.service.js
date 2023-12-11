/**
 * @file product.service.js
 * @description This module provides functions to interact with product data in the application. It includes methods for creating, retrieving, updating, and deleting products.
 */
import Product from "../models/product.model.js";
import APIError from "../utils/APIError.js";
import APIFeatures from "../utils/APIFeatures.js";

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
   * Get a product by its ID.
   * @param {string} productId - The ID of the product to retrieve.
   * @returns {Promise} A promise that resolves with the retrieved product or rejects with an error if not found.
   */
  async getProduct(productId) {
    const product = await Product.findOne({
      _id: productId,
      status: "Public",
      // todo: populate shop-location and shop-name.
    }).populate("sellerId", "firstName lastName");
    if (!product) {
      throw new APIError({
        status: 404,
        message: "There is no document found with this ID.",
      });
    }
    return product;
  },

  async getUserProducts() {
    const products = await Product.aggregate([
      { $sample: { size: 10 } },
      {
        $facet: {
          metadata: [{ $count: "totalResults" }],
          data: [{ $limit: 10 }],
        },
      },
      { $unwind: "$metadata" },
    ]);

    if (products.length === 0) {
      throw new APIError({
        status: 404,
        message: "There is no document found.",
      });
    }

    return {
      metadata: products[0].metadata,
      data: products[0].data,
    };
  },

  async getHotProducts(queryStr) {
    const features = new APIFeatures(Product, queryStr)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    let products = await features.execute();
    products = products[0];

    return products;
  },

  async getTopProducts(queryStr) {
    const topProductsQuery = {
      ...queryStr,
      averageRating: { gte: "4.5" },
      soldAmount: { gte: "100" },
    };

    const features = new APIFeatures(Product, topProductsQuery)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    let products = await features.execute();
    products = products[0];

    return products;
  },

  async getProductsByCategories(queryStr) {
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

    return products;
  },
};

export default productService;
