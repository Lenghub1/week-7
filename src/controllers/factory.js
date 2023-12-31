import catchAsync from "@/utils/catchAsync.js";

const factory = {
  /**
   *
   * This function is designed to be used as middleware in an Express.js route handler.
   * It takes a request (req), response (res), and next middleware (next) as parameters.
   * It invokes the 'createDocService' with the request body to create a new document.
   * Once the document is created, it sends a JSON response indicating success.
   *
   * @param {Function} createDocService - A service function responsible for document creation.
   * @returns {Function} Middleware function for document creation.
   */
  create(createDocService) {
    return catchAsync(async (req, res, next) => {
      const newProduct = await createDocService(req.body);

      res.json({
        message: "Document Created",
        data: { newProduct },
      });
    });
  },

  /**
   *
   * This function is designed to be used as middleware in an Express.js route handler.
   * It takes a request (req), response (res), and next middleware (next) as parameters.
   * It invokes the 'getDocService' with the request params to retrieve a document.
   * Once the document is retrieved, it sends a JSON response indicating success.
   *
   * @param {Function} getDocService - A service function responsible for fetching document by ID.
   * @returns {Function} Middleware function for one document retrieval.
   */
  getById(getDocService) {
    return catchAsync(async (req, res, next) => {
      const doc = await getDocService(req.params.id);

      res.json({
        message: "Data Retrieved",
        data: { doc },
      });
    });
  },

  /**
   *
   * This function is designed to be used as middleware in an Express.js route handler.
   * It takes a request (req), response (res), and next middleware (next) as parameters.
   * It invokes the 'updateDocService' with the request params to update a specific document.
   * Once the document is updated, it sends a JSON response indicating success.
   *
   * @param {Function} updateDocService - A service function responsible for updating a document.
   * @returns {Function} Middleware function for one document updation.
   */
  updateById(updateDocService) {
    return catchAsync(async (req, res, next) => {
      const updateDoc = await updateDocService(req.params.id, req.body);

      res.json({
        message: "Data Updated",
        data: { updateDoc },
      });
    });
  },

  /**
   *
   * This function is designed to be used as middleware in an Express.js route handler.
   * It takes a request (req), response (res), and next middleware (next) as parameters.
   * It invokes the 'deleteDocService' with the request params to delete a specific document.
   * Once the document is deleted, it sends a JSON response indicating success.
   *
   * @param {Function} deleteDocService - A service function responsible for deleting a specific document.
   * @returns {Function} Middleware function for one document deletion.
   */
  deleteById(deleteDocService) {
    return catchAsync(async (req, res, next) => {
      await deleteDocService(req.params.id);

      res.json({
        message: "Document Deleted",
        data: null,
      });
    });
  },

  /**
   *
   * This function is designed to be used as middleware in an Express.js route handler.
   * It takes a request (req), response (res), and next middleware (next) as parameters.
   * It invokes the 'getAllDocsService' function to retrieve all documents.
   * Once all the documents are retrieved, it sends a JSON response indicating success.
   *
   * @param {Function} getAllDocsService - A service function responsible for retrieving all documents in a collection.
   * @returns {Function} Middleware function for all documents retrieval.
   */
  getAll(getAllDocsService) {
    return catchAsync(async (req, res, next) => {
      const docs = await getAllDocsService(req.query);
      res.json({
        message: "Data Retrieved",
        results: docs?.length,
        docs,
      });
    });
  },
};

export default factory;
