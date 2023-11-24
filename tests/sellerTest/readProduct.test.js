import { setupTestDB } from "../utils/setupTestDB.js";
import request from "supertest";
import app from "../../src/app.js";
import {
  categories,
  insertManyProducts,
} from "../fixtures/sellerProduct.fixture.js";
import dotenv from "dotenv";
import Product from "../../src/models/product.model.js";

dotenv.config();

setupTestDB();

const baseAPI = "/api/v1/seller/products";

describe("Get own products (GET /seller/products)", () => {
  describe("Given not found endpoints", () => {
    it("must return 404", async () => {
      const res = await request(app).get("/api/v1/seller/productss");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Not found");
    });
  });

  describe("Given no query string", () => {
    const NUM_PRODUCTS = 400;

    it(`must limit to ${process.env.PAGE_LIMIT_DEFAULT}`, async () => {
      await insertManyProducts(NUM_PRODUCTS);

      const res = await request(app).get(baseAPI);

      // console.log("res.body:::", res.body);
      expect(res.status).toBe(200);
      expect(res.body.data.metadata).toEqual({
        totalResults: NUM_PRODUCTS,
        currentPage: 1,
        totalPages: Number(NUM_PRODUCTS / process.env.PAGE_LIMIT_DEFAULT),
        limit: Number(process.env.PAGE_LIMIT_DEFAULT),
      });
      expect(res.body.data.data.length).toEqual(
        Number(process.env.PAGE_LIMIT_DEFAULT)
      );
    });
  });

  describe("Given unitPrice query", () => {
    describe("Given unitPrice from 4 to 7", () => {
      it("must show result from 4 to 7", async () => {
        await insertManyProducts(100);

        const res = await request(app).get(
          `${baseAPI}?unitPrice[gte]=4&unitPrice[lte]=7`
        );

        expect(res.status).toBe(200);
        res.body.data.data.forEach((each) => {
          expect(each.unitPrice >= 4).toBe(true);
          expect(each.unitPrice <= 7).toBe(true);
        });
      });
    });

    describe("Given unitPrice[gte] is negative number", () => {
      it("must respond 400 bad request", async () => {
        await insertManyProducts(100);

        const res = await request(app).get(
          `${baseAPI}?unitPrice[gte]=-4000&unitPrice[lte]=-9000`
        );

        expect(res.status).toBe(400);
        expect(res.body.errors[0].path).toEqual("unitPrice.gte");
        expect(res.body.errors[1].path).toEqual("unitPrice.lte");
      });
    });
  });

  describe("Given availableStock query", () => {
    describe("Given availableStock from 0 to 12", () => {
      it("must show results from 0 to 12", async () => {
        await insertManyProducts(300);

        const res = await request(app).get(
          `${baseAPI}?availableStock[gte]=0&availableStock[lte]=12`
        );

        expect(res.status).toBe(200);
        res.body.data.data.forEach((each) => {
          expect(each.availableStock >= 0).toBe(true);
          expect(each.availableStock <= 12).toBe(true);
        });
      });
    });

    describe("Given availableStock as not integer", () => {
      it("must return 400 bad request", async () => {
        await insertManyProducts(10);

        const res = await request(app).get(
          `${baseAPI}?availableStock[gte]=tothemoon&availableStock[lte]=12`
        );

        expect(res.status).toBe(400);
        expect(res.body.errors[0].path).toEqual("availableStock.gte");
      });
    });
  });

  describe("Given categories query", () => {
    describe(`Given categories=${categories[0]}`, () => {
      it(`must show results that has categories=${categories[0]}`, async () => {
        await insertManyProducts(150);

        const res = await request(app).get(
          `${baseAPI}?categories=${categories[0]}`
        );

        expect(res.status).toBe(200);
        res.body.data.data.forEach((each) => {
          expect(each.categories.includes(categories[0])).toBe(true);
        });
      });
    });

    describe(`Given categories= ${categories[0]}, ${categories[2]}`, () => {
      it(`must show results that has categories= ${categories[0]}, ${categories[2]}`, async () => {
        await insertManyProducts(150);

        const res = await request(app).get(
          `${baseAPI}?categories=${categories[0]},${categories[2]}`
        );

        expect(res.status).toBe(200);
        res.body.data.data.forEach((each) => {
          expect(
            each.categories.includes(categories[2]) ||
              each.categories.includes(categories[0])
          ).toBe(true);
        });
      });
    });
  });

  describe("Given field limits query", () => {
    describe("Given fields=title, description", () => {
      it("must show only _id, title, description", async () => {
        await insertManyProducts(150);

        const res = await request(app).get(
          `${baseAPI}?fields=title,description`
        );

        expect(res.status).toBe(200);
        res.body.data.data.forEach((each) => {
          expect(Object.keys(each)).toEqual(["_id", "title", "description"]);
        });
      });
    });
  });

  describe("Given limit query", () => {
    describe("Given limit=10", () => {
      it("must show only 10 results", async () => {
        await insertManyProducts(90);

        const res = await request(app).get(`${baseAPI}?limit=10`);

        expect(res.status).toBe(200);
        expect(res.body.data.data.length).toBe(10);
      });
    });
  });

  describe("Given search query (ie. q)", () => {
    describe("Given search query = sues", () => {
      it("must show results related to 'sues'", async () => {
        const searchTerm = "plast sues";
        await insertManyProducts(250);

        // Why: to make AtlasSearch finish indexing before searching
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const products = await Product.aggregate([
          {
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
          },
          { $limit: 5 },
          { $project: { title: 1 } },
        ]).exec();

        const res = await request(app).get(
          `${baseAPI}?q=${searchTerm}&limit=5&fields=title`
        );

        expect(res.status).toBe(200);
        for (let i = 0; i < products.length; i++) {
          expect(res.body.data.data[i].title).toBe(products[i].title);
        }
      });
    });
  });

  describe("Given imgCover field", () => {
    it("must generate signed url for it", async () => {
      await insertManyProducts(10);

      const res = await request(app).get(
        `${baseAPI}?fields=title,imgCover,media&limit=4`
      );

      expect(res.status).toBe(200);
      expect(res.body.data.data.length).toBe(4);
      res.body.data.data.forEach((item) => {
        expect(item.imgCover.includes("X-Amz-Signature=")).toBe(true);
        item.media.forEach((eachMedia) =>
          expect(eachMedia.includes("X-Amz-Signature=")).toBe(false)
        );
      });
    });
  });
});

describe("Get own product detail", () => {
  describe("Given not available product ID", () => {
    it("must show 404 not found", async () => {
      const res = await request(app).get(`${baseAPI}/655f1035c84f800a020137cf`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("There is no document found with this ID.");
    });
  });

  describe("Given a valid product ID", () => {
    it("must return result with signed URL", async () => {
      const dummyProduct = await insertManyProducts(1);

      const res = await request(app).get(`${baseAPI}/${dummyProduct[0].id}`);
      const { imgCover } = res.body.data;
      const mediaUrl = res.body.data.media[0];

      expect(res.status).toBe(200);
      expect(imgCover.includes("X-Amz-Signature=")).toBe(true);
      expect(mediaUrl.includes("X-Amz-Signature=")).toBe(true);
    });
  });
});
