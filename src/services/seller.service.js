/**
 * @file product.service.js
 * @description This module provides functions to interact with product data in the application. It includes methods for creating, retrieving, updating, and deleting products.
 */
import Product from "../models/product.model.js";
import APIError from "../utils/APIError.js";
import APIFeatures from "../utils/APIFeatures.js";
import utils from "../utils/utils.js";
import { deleteFile, uploadFile, getFileSignedUrl } from "../config/s3.js";
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

const sellerService = {
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

    // get signed URL if imgCover is availble
    await Promise.all(
      products.data.map(async (each) => {
        if (each.imgCover)
          each.imgCover = await getFileSignedUrl(each.imgCover);
      })
    );

    // get more metadata for pagination
    products.metadata = utils.getPaginateMetadata(products.metadata, queryStr);

    return products;
  },

  /**
   * Get own product detail (for seller)
   * @param {string} productId - The ID of the product to retrieve.
   * @returns {Promise} A promise that resolves with the retrieved product or rejects with an error if not found.
   */
  async getOwnProductDetail(productId) {
    const product = await Product.findById(productId).select("-__v");
    if (!product) {
      throw new APIError({
        status: 404,
        message: "There is no document found with this ID.",
      });
    }

    const allFileUrls = [];
    allFileUrls.push(product.imgCover);
    product.media.map((each) => allFileUrls.push(each));

    const urls = await Promise.all(
      allFileUrls.map(async (each) => await getFileSignedUrl(each))
    );

    product.imgCover = urls[0];
    product.media = urls.slice(1);

    return product;
  },

  /**
   * Create product
   * @param {FileObject} imgCover
   * @param {FileObject} media
   * @param {ProductObject} productInput
   */
  async createProduct(imgCover, media, productInput) {
    const allFiles = [];
    try {
      // Check if same user has the same product title
      const foundProd = await Product.findOne({
        sellerId: productInput.sellerId,
        title: productInput.title,
      }).select("title sellerId");
      if (foundProd)
        throw new APIError({
          status: 400,
          message: `found product with same title: '${productInput.title}'`,
        });

      // prepare file names
      const imgCoverName = utils.generateFileName(
        "products",
        imgCover[0].originalname,
        imgCover[0].mimetype
      );

      allFiles.push({
        name: imgCoverName,
        buffer: imgCover[0].buffer,
        mimetype: imgCover[0].mimetype,
      });

      productInput.imgCover = imgCoverName;
      productInput.media = [];
      media.map((each) => {
        const eachName = utils.generateFileName(
          "products",
          each.originalname,
          each.mimetype
        );
        productInput.media.push(eachName);
        allFiles.push({
          name: eachName,
          buffer: each.buffer,
          mimetype: each.mimetype,
        });
      });

      // upload all files to S3
      await Promise.all(
        allFiles.map(
          async (eachFile) =>
            await uploadFile(eachFile.buffer, eachFile.name, eachFile.mimetype)
        )
      );

      // save in Product model
      const newProduct = new Product(productInput);
      await newProduct.save();
      return newProduct;
    } catch (error) {
      // Delete uploaded files if error and available
      if (allFiles.length > 0)
        await Promise.all(
          allFiles.map(async (eachFile) => await deleteFile(eachFile.name))
        );

      throw error;
    }
  },

  /**
   * // TODO: Delete a product by its ID.
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
   * // TODO: Update a product with the provided input by its ID.
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
};

export default sellerService;
