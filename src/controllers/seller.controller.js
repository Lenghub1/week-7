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
      "sellerID",
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
    const products = await service.getOwnProducts(req.query);

    return res.json({
      message: "Data Retrieved",
      data: products,
    });
  }),

  getOwnProductDetail: catchAsync(async (req, res, next) => {
    const product = await service.getOwnProductDetail(req.params.id);

    return res.json({
      message: "Data Retrieved",
      data: product,
    });
  }),

  deleteProduct: catchAsync(async (req, res, next) => {
    await service.deleteProduct(req.params.id, "sellerID");
    return res.status(204).json({
      message: "Data deleted",
    });
  }),
};

export default sellerController;
