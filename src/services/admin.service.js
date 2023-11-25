import Product from "../models/product.model.js";
import APIError from "../utils/APIError.js";
import utils from "../utils/utils.js";
import { uploadFile, deleteFile, getFileSignedUrl } from "../config/s3.js";
import APIFeatures from "../utils/APIFeatures.js";
import Seller from "./../models/seller.model.js";

const adminService = {
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
        "products/imageCover",
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
          "products/media",
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
      // if an error occurred when creating a product document,
      // delete images that are sent to S3
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
    const features = new APIFeatures(Product, queryStr)
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
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return new APIError({
          status: 400,
          message: `Cannot find product with this ID ${productId}`,
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
    } catch (error) {
      throw error;
    }
  },

  async searchSeller(query) {
    try {
      const searchQuery = query;
      const searchTerms = searchQuery.split(/\s+/).filter(Boolean);
      const regexPatterns = searchTerms.map((term) => new RegExp(term, "i"));

      const pipeLine = [
        {
          $match: {
            active: true,
            $and: regexPatterns.map((pattern) => ({
              storeAndSellerName: { $regex: pattern },
            })),
          },
        },
      ];
      const sellers = await Seller.aggregate(pipeLine);
      return sellers;
    } catch (error) {
      console.log(error);
      throw new APIError({
        status: 500,
        message: "Internal server error",
      });
    }
  },
};

export default adminService;
