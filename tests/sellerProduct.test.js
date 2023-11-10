import { setupTestDB } from "./utils/setupTestDB.js";
import request from "supertest";
import app from "../src/app.js";
import { faker } from "@faker-js/faker";
import {
  categories,
  insertManyProducts,
} from "./fixtures/sellerProduct.fixture.js";
import dotenv from "dotenv";
import Product from "../src/models/product.model.js";

dotenv.config();

setupTestDB();

describe("Get own products (GET /products/own)", () => {
  describe("Given not found endpoints", () => {
    it("must return 404", async () => {
      const res = await request(app).get("/api/v1/productss");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Not found");
    });
  });

  describe("Given no query string", () => {
    const NUM_PRODUCTS = 400;

    it(`must limit to ${process.env.PAGE_LIMIT_DEFAULT}`, async () => {
      await insertManyProducts(NUM_PRODUCTS);

      const res = await request(app).get("/api/v1/products/own");

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
    describe("Given unitPrice from 40000 to 100000", () => {
      it("must show result from 40000 to 100000", async () => {
        await insertManyProducts(100);

        const res = await request(app).get(
          "/api/v1/products/own?unitPrice[gte]=40000&unitPrice[lte]=100000"
        );

        expect(res.status).toBe(200);
        res.body.data.data.forEach((each) => {
          expect(each.unitPrice >= 40000).toBe(true);
          expect(each.unitPrice <= 100000).toBe(true);
        });
      });
    });

    describe("Given unitPrice[gte] is not integer", () => {
      it("must respond 400 bad request", async () => {
        await insertManyProducts(100);

        const res = await request(app).get(
          "/api/v1/products/own?unitPrice[gte]=-4000&unitPrice[lte]=-9000"
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
          "/api/v1/products/own?availableStock[gte]=0&availableStock[lte]=12"
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
          "/api/v1/products/own?availableStock[gte]=tothemoon&availableStock[lte]=12"
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
          `/api/v1/products/own?categories=${categories[0]}`
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
          `/api/v1/products/own?categories=${categories[0]},${categories[2]}`
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
          `/api/v1/products/own?fields=title,description`
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

        const res = await request(app).get(`/api/v1/products/own?limit=10`);

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
          `/api/v1/products/own?q=${searchTerm}&limit=5&fields=title`
        );

        expect(res.status).toBe(200);
        for (let i = 0; i < products.length; i++) {
          expect(res.body.data.data[i].title).toBe(products[i].title);
        }
      });
    });
  });
});

describe("Create one product", () => {
  let newProduct;
  beforeEach(() => {
    newProduct = {
      description: faker.lorem.paragraph(),
      unitPrice: 1200,
      unit: "item",
    };
  });

  describe("Given no title", () => {
    it("must show 400 bad request", async () => {
      const res = await request(app).post("/api/v1/products").send(newProduct);
      expect(res.status).toBe(400);
      expect(res.body.errors[0].path).toBe("title");
    });
  });

  describe("Given full product detail", () => {
    it("must show 201 created", async () => {
      newProduct.title = faker.animal.cow();

      const res = await request(app).post("/api/v1/products").send(newProduct);
    });
  });
});
