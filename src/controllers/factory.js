import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

const factory = {
  createOne(createDocService) {
    return catchAsync(async (req, res, next) => {
      await createDocService(req.body);
      res.json({ message: "Create a product" });
    });
  },

  getById(getOneDoc) {
    return catchAsync(async (req, res, next) => {
      const doc = await getOneDoc(req.params.id);
      res.json({
        message: "Data Retrived",
        data: { doc },
      });
    });
  },

  updateOne(updateOneDoc) {
    return catchAsync(async (req, res, next) => {
      const updateDoc = await updateOneDoc(req.params.id, req.body);
      if (!doc) {
        return next(AppError("There is no document found with this ID.", 404));
      }
      res.json({
        message: "Data Updated",
        data: { updateDoc },
      });
    });
  },

  deleteOne(deleteOneDoc) {
    return catchAsync(async (req, res, next) => {
      const doc = await deleteOneDoc(req.params.id);
      if (doc === undefined) {
        return next(AppError("There is no document found with this ID.", 404));
      }
      res.json({
        message: "Document Deleted",
        data: null,
      });
    });
  },

  getAll(getAllDocs) {
    return catchAsync(async (req, res, next) => {
      const docs = await getAllDocs();
      res.json({
        message: "Data Retrived",
        results: docs.length,
        data: { docs },
      });
    });
  },
};

export default factory;
