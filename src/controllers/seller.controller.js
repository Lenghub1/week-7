import service from "../services/seller.service.js";
import APIError from "../utils/APIError.js";
import catchAsync from "../utils/catchAsync.js";

const sellerController = {
  createProduct: catchAsync(async (req, res, next) => {
    if (!req.files.imgCover || !req.files.media)
      throw new APIError({
        status: 400,
        message: "imgCover and media are required",
      });

    req.body.sellerId = req.user.id;
    const newProduct = await service.createProduct(
      req.files.imgCover,
      req.files.media,
      req.body
    );

    return res.status(201).json({
      message: "Product Created",
      data: { newProduct },
    });
  }),

  updateProduct: catchAsync(async (req, res, next) => {
    const updatedProduct = await service.updateProduct(
      req.params.id,
      req.user.id,
      req.files?.imgCover,
      req.files?.media,
      req.body
    );
    return res.status(200).json({
      message: "Product Updated",
      data: updatedProduct,
    });
  }),

  getOwnProducts: catchAsync(async (req, res, next) => {
    req.query.sellerId = req.user.id;
    const products = await service.getOwnProducts(req.query);

    return res.json({
      message: "Data Retrieved",
      data: products,
    });
  }),

  getOwnProductDetail: catchAsync(async (req, res, next) => {
    const product = await service.getOwnProductDetail(
      req.params.id,
      req.user.id
    );

    return res.json({
      message: "Data Retrieved",
      data: product,
    });
  }),

  deleteProduct: catchAsync(async (req, res, next) => {
    const deleteResult = await service.deleteProduct(
      req.params.id,
      req.user.id
    );

    if (deleteResult.modifiedCount == 0)
      return res.status(404).json({ message: "no file deleted" });

    return res.status(204).json({
      message: "Data deleted",
    });
  }),
};

export default sellerController;
