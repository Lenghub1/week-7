/**
 * @fileoverview I test API fetures but using aggregate pipeline instead
 */

class APIFeatures {
  constructor(model, queryStr, isAdmin = false, generatePipeline) {
    this.model = model;
    this.aggPipe = [];
    this.queryStr = queryStr;
    this.isAdmin = isAdmin;
    this.generatePipeline = generatePipeline;
  }

  search() {
    const searchTerm = this.queryStr.q;
    if (this.isAdmin && searchTerm) {
      // when admin is true, use regex-based search
      const searchTerms = searchTerm.split(/\s+/).filter(Boolean);
      const regexPatterns = searchTerms.map((term) => new RegExp(term, "i"));

      if (typeof this.generatePipeline === "function") {
        const searchPipeline = this.generatePipeline(regexPatterns);
        this.aggPipe.push(...searchPipeline);
      } else {
        this.aggPipe.push({
          $match: {
            $and: regexPatterns.map((pattern) => ({
              title: { $regex: pattern },
            })),
          },
        });
      }
    } else if (searchTerm) {
      this.aggPipe.push({
        $search: {
          index: "product-search",
          compound: {
            should: [
              {
                text: {
                  query: searchTerm,
                  path: "title",
                  score: { boost: { value: 3 } },
                  fuzzy: {},
                },
              },
              {
                text: {
                  query: searchTerm,
                  path: "description",
                  fuzzy: {},
                },
              },
            ],
          },
        },
      });
    }

    return this;
  }

  filter() {
    let queryObj = { ...this.queryStr };
    const dateRelatedFields = ["createdAt", "updatedAt"];
    const excludedFields = ["page", "sort", "limit", "fields", "q"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    queryObj = JSON.parse(queryStr);

    Object.keys(queryObj).forEach((eachKey) => {
      // Convert $gte value to Number()
      for (const key in queryObj[eachKey])
        if (/\b(gte|gt|lte|lt)\b/g.test(key)) {
          if (!dateRelatedFields.includes(eachKey)) {
            queryObj[eachKey][key] = Number(queryObj[eachKey][key]);
          } else {
            queryObj[eachKey][key] = new Date(queryObj[eachKey][key]);
          }
        }

      if (Array.isArray(queryObj[eachKey])) {
        queryObj[eachKey] = { $all: queryObj[eachKey] };
      }
    });

    this.aggPipe.push({ $match: queryObj });

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",");
      const sortObj = {};
      sortBy.forEach((item) => {
        if (item.startsWith("-")) sortObj[item.slice(1)] = -1;
        else sortObj[item] = 1;
      });

      this.aggPipe.push({ $sort: sortObj });
    } else if (this.queryStr.q) {
      return this;
    } else {
      this.aggPipe.push({ $sort: { createdAt: -1 } });
    }

    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",");
      const fieldObj = {};
      fields.forEach((item) => {
        if (item.startsWith("-")) fieldObj[item.slice(1)] = 0;
        else fieldObj[item] = 1;
      });
      this.aggPipe.push({ $project: fieldObj });
    } else {
      this.aggPipe.push({ $project: { __v: 0 } });
    }

    return this;
  }

  paginate() {
    const page = Number(this.queryStr.page) || 1;
    const limit = Number(this.queryStr.limit || process.env.PAGE_LIMIT_DEFAULT);
    const skip = (page - 1) * limit;

    this.aggPipe.push({
      $facet: {
        metadata: [{ $count: "totalResults" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    });

    this.aggPipe.push({ $unwind: "$metadata" });

    return this;
  }

  async execute() {
    return await this.model.aggregate(this.aggPipe);
  }
}

export default APIFeatures;
