/**
 * @fileoverview Use this file to create dummy data for development/testing purposes
 */

import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import Product from "../../src/models/product.model.js";
import dotenv from "dotenv";
import { categories } from "../fixtures/sellerProduct.fixture.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI_DEV).then(() => {
  console.log("DB connection open for seeding...");
});

function generateSeedProducts(n) {
  const productUnits = Product.schema.path("unit").enumValues;
  const productStatuses = Product.schema.path("status").enumValues;

  let products = [];

  function chooseRandomPrice(min, max) {
    const randomDecimal = Math.random();
    // Scale the random decimal to the range between min and max
    const randomInRange = randomDecimal * (max - min) + min;
    // Round the result to avoid floating-point precision issues
    const randomPrice = Math.round(randomInRange / 100) * 100;

    return randomPrice;
  }

  for (let i = 0; i < n; i++) {
    const title = faker.commerce.productName();
    const slug = title + faker.string.uuid();
    const product = new Product({
      title,
      slug,
      description: faker.commerce.productDescription(),
      unit: faker.helpers.arrayElement(productUnits),
      unitPrice: chooseRandomPrice(1000, 1000000),
      availableStock: faker.number.int(100),
      media: [faker.airline.aircraftType()],
      categories: faker.helpers.arrayElements(categories, {
        min: 1,
        max: 3,
      }),
      status: faker.helpers.arrayElement(productStatuses),
    });
    products.push(product);
  }

  return products;
}

async function seedDB() {
  try {
    const seedProducts = generateSeedProducts(1000);
    await Product.deleteMany();
    await Product.insertMany(seedProducts);
  } catch (error) {
    console.log("Error:", error.message);
  }
}

seedDB()
  .then(() => {
    return mongoose.connection.close();
  })
  .then(() => {
    console.log("DB seeding done. Closed DB connection...");
  });
