import Product from "@/models/product.model.js";
import APIError from "@/utils/APIError.js";
import utils from "@/utils/utils.js";
import { uploadFile, deleteFile, getFileSignedUrl } from "@/config/s3.js";
import APIFeatures from "@/utils/APIFeatures.js";

import mongoose from "mongoose";

const productServiceAdmin = {
  async createProduct(imgCover, media, productInput) {
    const allFiles = [];
    try {
      const foundProduct = await Product.findOne({
        sellerId: productInput.sellerId,
        title: productInput.title,
      }).select("title sellerId");
      if (foundProduct) {
        throw new APIError({
          status: 400,
          message: `Found product with same title: '${productInput.title}'`,
        });
      }

      // generate file names
      const imgCoverName = utils.generateFileName(
        "products-update/imageCover",
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
          "products-update/media",
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

      await Promise.all(
        allFiles.map(
          async (eachFile) =>
            await uploadFile(eachFile.buffer, eachFile.name, eachFile.mimetype)
        )
      );

      const newProduct = new Product(productInput);
      await newProduct.save();
      return newProduct;
    } catch (error) {
      /*
      if an error occurred when creating a product document, delete images that are sent to S3
      */
      if (allFiles.length > 0)
        await Promise.all(
          allFiles.map(async (eachFile) => await deleteFile(eachFile.name))
        );

      throw error;
    }
  },

  async getProducts(queryStr) {
    if (queryStr.categories)
      queryStr.categories = queryStr.categories.split(",");
    const features = new APIFeatures(Product, queryStr, true)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    let products = await features.execute();
    products = products[0];

    if (!products) {
      throw new APIError({
        status: 404,
        message: "There is no document found.",
      });
    }

    products.metadata = utils.getPaginateMetadata(products.metadata, queryStr);

    return products;
  },

  async getProductById(productId) {
    const product = await Product.findById(productId).populate("sellerId");
    if (!product) {
      return new APIError({
        status: 404,
        message: `Cannot find product with this ID ${productId}`,
      });
    }
    const allFileUrls = [];
    allFileUrls.push(product.imgCover);
    product.media.map((each) => allFileUrls.push(each));

    const urls = await Promise.all(
      allFileUrls.map(async (each) => await getFileSignedUrl(each))
    );

    product.signedImgCover = urls[0];
    product.signedMedia = urls.slice(1);
    return product;
  },

  async updateProduct({ productInput, newImgCover, newMedia, productId }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new APIError({
          message: `Cannot find product with this ID: ${productId}`,
          status: 400,
        });
      }

      // Exclude media and imgCover from the fields to update
      const fieldsToUpdate = Object.keys(productInput).filter(
        (field) =>
          field !== "media" && field !== "imgCover" && field !== "categories"
      );

      fieldsToUpdate.forEach((field) => {
        product[field] = productInput[field];
      });

      const { media } = productInput;

      let deletedMedia;
      if (
        typeof media !== "undefined" &&
        media.length !== product.media.length
      ) {
        const filteredMedia = product.media.filter((item) =>
          media.includes(item)
        );
        deletedMedia = product.media.filter((item) => !media.includes(item));

        product.media = filteredMedia;
      }

      if (productInput.categories) {
        product.categories = productInput.categories.split(",");
      }

      let imgCoverName;
      let previousImgCover;
      const newMediaNames = [];
      if (newImgCover) {
        imgCoverName = utils.generateFileName(
          "products-update/imageCover",
          newImgCover[0].originalname,
          newImgCover[0].mimetype
        );
        previousImgCover = product.imgCover;
        product.imgCover = imgCoverName;
      }

      if (newMedia) {
        const names = newMedia.map((each) => {
          return utils.generateFileName(
            "products-update/media",
            each.originalname,
            each.mimetype
          );
        });
        names.map((each) => {
          product.media.push(each);
          newMediaNames.push(each);
        });
      }

      await product.save({ session });

      if (newImgCover) {
        const imgCoverParams = {
          name: imgCoverName,
          buffer: newImgCover[0].buffer,
          mimetype: newImgCover[0].mimetype,
        };

        await uploadFile(
          imgCoverParams.buffer,
          imgCoverParams.name,
          imgCoverParams.mimetype
        );
      }

      if (newMedia) {
        const mediaParams = newMedia.map((each, index) => {
          return {
            name: newMediaNames[index],
            buffer: each.buffer,
            mimetype: each.mimetype,
          };
        });

        await Promise.all(
          mediaParams.map(
            async (eachFile) =>
              await uploadFile(
                eachFile.buffer,
                eachFile.name,
                eachFile.mimetype
              )
          )
        );
      }
      await session.commitTransaction();

      // Delete files only if the transaction is successfully committed
      if (newImgCover) {
        // If delete operations fail, we can, later, manually delete the deleted files
        try {
          await deleteFile(previousImgCover);
        } catch (deleteError) {
          console.error(`Error deleting imgCover: ${deleteError.message}`);
        }
      }

      if (deletedMedia.length > 0) {
        await Promise.all(
          deletedMedia.map(async (item) => {
            try {
              await deleteFile(item);
            } catch (deleteError) {
              console.error(
                `Error deleting media file: ${deleteError.message}`
              );
            }
          })
        );
      }

      return product;
    } catch (error) {
      await session.abortTransaction();
      throw new APIError({
        status: 500,
        message: "Something went wrong! Cannot update the product.",
      });
    } finally {
      session.endSession();
    }
  },
};

export default productServiceAdmin;
