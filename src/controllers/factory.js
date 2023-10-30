import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/APIError.js";

const factory = {
  create(createDocService) {
    return catchAsync(async (req, res, next) => {
      await createDocService(req.body);
      res.json({ message: "Create a product" });
    });
  },

  getById(getDocService) {
    return catchAsync(async (req, res, next) => {
      const doc = await getDocService(req.params.id);
      res.json({
        message: "Data Retrived",
        data: { doc },
      });
    });
  },

  updateById(updateDocService) {
    return catchAsync(async (req, res, next) => {
      const updateDoc = await updateDocService(req.params.id, req.body);

      res.json({
        message: "Data Updated",
        data: { updateDoc },
      });
    });
  },

  deleteById(deleteDocService) {
    return catchAsync(async (req, res, next) => {
      const doc = await deleteDocService(req.params.id);

      res.json({
        message: "Document Deleted",
        data: null,
      });
    });
  },

  getAll(getAllDocsService) {
    return catchAsync(async (req, res, next) => {
      const docs = await getAllDocsService();
      res.json({
        message: "Data Retrived",
        results: docs.length,
        data: { docs },
      });
    });
  },
};

export default factory;
