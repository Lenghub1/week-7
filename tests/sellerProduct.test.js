import { setupTestDB } from "./utils/setupTestDB.js";
import request from "supertest";
import app from "../src/app.js";
import { faker } from "@faker-js/faker";

setupTestDB();

describe("Get all products (GET /products)", () => {
  describe("Given not found endpoints", () => {
    it("should return 404", async () => {
      const res = await request(app).get("/api/v1/productss");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Not found");
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
    it("should show 400 bad request", async () => {
      const res = await request(app).post("/api/v1/products").send(newProduct);
      expect(res.status).toBe(400);
      expect(res.body.errors[0].path).toBe("title");
    });
  });

  describe("Given full product detail", () => {
    it("should show 201 created", async () => {
      newProduct.title = faker.animal.cow();

      const res = await request(app).post("/api/v1/products").send(newProduct);
    });
  });
});
