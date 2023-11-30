import { randomBytes } from "node:crypto";

const utils = {
  getPaginateMetadata(metadata, queryStr) {
    const limit = parseInt(queryStr.limit || process.env.PAGE_LIMIT_DEFAULT);
    const currentPage = parseInt(queryStr.page || 1);
    const totalPages = Math.ceil(metadata.totalResults / limit);

    return {
      ...metadata,
      currentPage,
      totalPages,
      limit,
    };
  },

  /**
   * @param {String} folderName
   * @param {String} originalName
   * @param {String} mimetype
   * @returns {String} file name with the format "folder/cryptoToken_originalname.extension"
   */
  generateFileName(folderName, originalName, mimetype) {
    const ext = mimetype.split("/")[1];
    let cleanName = originalName
      .replace(/[^\w.-]/g, " ")
      .trim()
      .replace(/\s+/g, "-")
      .split(".");

    if (cleanName.length > 1) cleanName = cleanName.slice(0, -1).join("");
    else cleanName = cleanName.join("");

    return `${folderName}/${randomBytes(16).toString(
      "hex"
    )}_${cleanName}.${ext}`;
  },
};

export default utils;
