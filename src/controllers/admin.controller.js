import APIError from "../utils/APIError.js";
import catchAsync from "../utils/catchAsync.js";
import adminService from "../services/admin.service.js";

const adminController = {
  createProduct: catchAsync(async (req, res, next) => {
    if (!req.files.imgCover || !req.files.media) {
      throw new APIError({
        status: 400,
        message: "imgCover and media are required",
      });
    }

    const newProduct = await adminService.createProduct(
      req.files.imgCover,
      req.files.media,
      req.body
    );

    return res.status(201).json({
      message: "Product Created",
      data: {
        newProduct,
      },
    });
  }),

  getProducts: catchAsync(async (req, res, next) => {
    const products = await adminService.getProducts(req.query);

    return res.json({
      message: "Data Retrieved",
      data: products,
    });
  }),

  getProductById: catchAsync(async (req, res, next) => {
    const product = await adminService.getProductById(req.params.id);
    return res.status(200).json({
      message: "Data retrieved",
      product: product,
    });
  }),

  searchSeller: catchAsync(async (req, res, next) => {
    const sellers = await adminService.searchSeller(req.query.q);
    return res.status(200).json(sellers);
  }),
};

export default adminController;
