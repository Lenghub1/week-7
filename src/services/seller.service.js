/**
 * @file product.service.js
 * @description This module provides functions to interact with product data in the application. It includes methods for creating, retrieving, updating, and deleting products.
 */
import Product from "../models/product.model.js";
import APIError from "../utils/APIError.js";
import APIFeatures from "../utils/APIFeatures.js";
import utils from "../utils/utils.js";
import { deleteFile, uploadFile, getFileSignedUrl } from "../config/s3.js";
import mongoose from "mongoose";

/**
 * @typedef {Object} ProductInput
 * @property {string} title - The title of the product.
 * @property {string} description - The description of the product.
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
      .filterDeleteStatus(false)
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
   * @param {string} ownerId
   * @returns {Promise} A promise that resolves with the retrieved product or rejects with an error if not found.
   */
  async getOwnProductDetail(productId, ownerId) {
    let product = await Product.findOne({
      _id: productId,
      sellerId: ownerId,
      status: { $ne: "deleted" },
    }).select("-__v");
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

    product._doc.signedImgCover = urls[0];
    product._doc.signedMedia = urls.slice(1);

    return product;
  },

  /**
   * Create product
   * @param {FileObject} imgCover
   * @param {FileObject} media
   * @param {ProductObject} productInput
   * @returns {Promise} - Promise that resolves new product document
   */
  async createProduct(imgCover, media, productInput) {
    const allFiles = [];
    try {
      // Check if same user has the same product title
      const foundProd = await Product.findOne({
        sellerId: productInput.sellerId,
        title: productInput.title,
        status: { $ne: "deleted" },
      }).select("title sellerId");
      if (foundProd)
        throw new APIError({
          status: 400,
          message: `found product with same title: '${productInput.title}'`,
        });

      // prepare file names
      const imgCoverName = utils.generateFileName(
        "products-test",
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
          "products-test",
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
   * Update a product with the provided input by its ID and owner.
   * @param {String} productId - The ID of the product to update.
   * @param {String} sellerId - The ID of product owner (aka seller)
   * @param {FileObject} newImgCoverFile
   * @param {FileObject} newMediaFiles
   * @param {ProductObject} productInput - The updated product data (only the changed part).
   * @returns {Promise} A promise that resolves with the updated product or rejects with an error if not found.
   */
  async updateProduct(
    productId,
    sellerId,
    newImgCoverFile,
    newMediaFiles,
    productInput
  ) {
    // [{name, buffer, mimetype}, ...]
    const filesToUpload = [];

    // ['filename1', 'filename2', ...]
    const filesToDelete = [];

    const CONDITION = {
      _id: productId,
      sellerId,
      status: { $ne: "deleted" },
    };

    // find Product
    const foundProductFiles = await Product.findOne(CONDITION).select(
      "title imgCover media"
    );

    if (!foundProductFiles)
      throw new APIError({
        status: 404,
        message: "There is no product found with this ID.",
      });

    // deal with imgCover
    if (newImgCoverFile) {
      const filename = utils.generateFileName(
        "products-test",
        newImgCoverFile[0].originalname,
        newImgCoverFile[0].mimetype
      );

      productInput.imgCover = filename;
      filesToDelete.push(foundProductFiles.imgCover);
      filesToUpload.push({
        name: filename,
        buffer: newImgCoverFile[0].buffer,
        mimetype: newImgCoverFile[0].mimetype,
      });
    }

    // deal with media
    let updatedMediaList = [];
    // remove the removedMedia
    updatedMediaList = foundProductFiles.media.filter(
      (item) => !productInput.removedMedia.includes(item)
    );
    for (let i = 0; i < productInput.removedMedia.length; i++)
      filesToDelete.push(productInput.removedMedia[i]);

    // add new to updatedMediaList
    if (newMediaFiles)
      newMediaFiles.map((each) => {
        const filename = utils.generateFileName(
          "products-test",
          each.originalname,
          each.mimetype
        );
        updatedMediaList.push(filename);

        filesToUpload.push({
          name: filename,
          buffer: each.buffer,
          mimetype: each.mimetype,
        });
      });

    // validate remove and add new
    if (updatedMediaList.length < 1)
      throw new APIError({ status: 400, message: "media files are required." });
    else if (updatedMediaList.length > 3)
      throw new APIError({ status: 400, message: "maximum 3 media files" });

    productInput.media = updatedMediaList;

    // update product data - check if same seller has same product title
    const redundantTitles = await Product.countDocuments({
      _id: { $ne: productId },
      title: productInput.title,
      status: { $ne: "deleted" },
    });
    if (redundantTitles > 0)
      throw new APIError({
        status: 400,
        message: `found product with same title: '${productInput.title}'`,
      });

    // update product data - start the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    let product;
    try {
      product = await Product.findOneAndUpdate(CONDITION, productInput, {
        new: true,
        session,
      });

      // S3 Process - upload files
      await Promise.all(
        filesToUpload.map(
          async (eachFile) =>
            await uploadFile(eachFile.buffer, eachFile.name, eachFile.mimetype)
        )
      );

      await session.commitTransaction();

      // S3 Process - delete files
      try {
        await Promise.all(
          filesToDelete.map(
            async (eachFileName) => await deleteFile(eachFileName)
          )
        );
      } catch (error) {
        console.log("===delete files error===", error);
      }

      return product;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  },

  /**
   * Delete a product by its ID and owner.
   * @param {String} productId - The ID of the product to delete.
   * @param {String} sellerId
   * @returns {Promise} A promise that resolves with the deleted product or rejects with an error if not found.
   */
  async deleteProduct(productId, sellerId) {
    const deleteStatus = await Product.updateOne(
      {
        _id: productId,
        sellerId,
        status: { $ne: "deleted" },
      },
      { status: "deleted" }
    );

    return deleteStatus;
  },
};

export default sellerService;
