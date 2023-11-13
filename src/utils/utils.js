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
};

export default utils;
