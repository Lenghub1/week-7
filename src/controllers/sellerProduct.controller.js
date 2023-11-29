import service from "../services/product.service.js";
import catchAsync from "../utils/catchAsync.js";
import factory from "./factory.js";

const productController = {
  createProduct: factory.create(service.createProduct),
  getProduct: factory.getById(service.getProduct),
  updateProduct: factory.updateById(service.updateProduct),
  deleteProduct: factory.deleteById(service.deleteProduct),
  getAllProducts: factory.getAll(service.getAllProducts),

  getOwnProducts: catchAsync(async (req, res, next) => {
    const products = await service.getOwnProducts(req.query);

    return res.json({
      message: "Data Retrieved",
      data: products,
    });
  }),
};

export default productController;
