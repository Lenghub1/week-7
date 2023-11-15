// Import necessary error handling utilities.
import APIError from "../utils/APIError.js";
import APIFeatures from "../utils/APIFeatures.js";

/**
 * Reusable service function for working with Mongoose models.
 *
 * @param {Model} Model - The Mongoose model to create a service for.
 * @returns {Object} - An object containing CRUD (Create, Read, Update, Delete) methods for the specified model.
 */
const createService = (Model) => {
  // Define a service object with various CRUD (Create, Read, Update, Delete) methods.
  const service = {
    /**
     * Retrieve a list of items based on query parameters.
     *
     * @param {Object} queryString - Query parameters for filtering, sorting, limiting, and pagination.
     * @returns {Promise<Array>} - A list of items that match the query parameters.
     * @throws {APIError} - Throws an error if there's an issue with the query or if no items match the criteria.
     */
    async getAll(queryString) {
      // Create and apply filters, sorting, field limiting, and pagination to the query.
      const features = new APIFeatures(Model.find(), queryString)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      // Execute the query and return the result.
      const items = await features.query;
      return items;
    },

    /**
     * Retrieve a single item by its unique identifier (ID).
     *
     * @param {string} id - The unique identifier of the item to retrieve.
     * @returns {Promise<Model|null>} - The retrieved item, or null if not found.
     * @throws {APIError} - Throws an error if there's an issue with the retrieval or if the item is not found.
     */
    async get(id) {
      // Attempt to find and return the item by its ID.
      const item = await Model.findById(id);
      if (!item) {
        // If the item is not found, throw an APIError indicating the status and a custom error message.
        throw new APIError({
          status: 404,
          message: `No ${Model.modelName} Found with this ID`,
        });
      }
      return item;
    },

    /**
     * Create a new item.
     *
     * @param {Object} itemBody - The data to create the new item.
     * @returns {Promise<Model>} - The created item.
     * @throws {APIError} - Throws an error if there's an issue with the creation process.
     */
    async create(itemBody) {
      // Attempt to create a new item with the provided data.
      const item = await Model.create(itemBody);
      if (!item) {
        // If the creation is unsuccessful, throw an APIError indicating the status and a custom error message.
        throw new APIError({
          status: 400,
          message: `Cannot Create ${Model.modelName}`,
        });
      }
      return item;
    },

    /**
     * Update an item by its unique identifier (ID).
     *
     * @param {string} id - The unique identifier of the item to update.
     * @param {Object} itemBody - The data to update the item.
     * @returns {Promise<Model|null>} - The updated item, or null if not found.
     * @throws {APIError} - Throws an error if there's an issue with the update process or if the item is not found.
     */
    async update(id, itemBody) {
      // Attempt to update the item by its ID with the provided data.
      const item = await Model.findByIdAndUpdate(id, itemBody);
      if (!item) {
        // If the item is not found for updating, throw an APIError indicating the status and a custom error message.
        throw new APIError({
          status: 404,
          message: `No ${Model.modelName} Found with this ID`,
        });
      }
      return item;
    },

    /**
     * Delete an item by its unique identifier (ID).
     *
     * @param {string} id - The unique identifier of the item to delete.
     * @returns {Promise<null>} - Returns null to indicate successful deletion.
     * @throws {APIError} - Throws an error if there's an issue with the deletion process or if the item is not found.
     */
    async delete(id) {
      // Attempt to find and delete the item by its ID.
      const item = await Model.findByIdAndDelete(id);
      if (!item) {
        // If the item is not found for deletion, throw an APIError indicating the status and a custom error message.
        throw APIError({
          status: 404,
          message: `No ${Model.modelName} Found with this ID`,
        });
      }
      // Return null to indicate successful deletion.
      return null;
    },
  };

  return service;
};

// Export the createService function to make it available for use with various Mongoose models.
export default createService;
