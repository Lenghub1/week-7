/**
 * @fileoverview Use this file to create dummy data for development/testing purposes
 */

import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import Product from "../../src/models/product.model.js";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI_DEV).then(() => {
  console.log("DB connection open for seeding...");
});

function generateSeedProducts(n) {
  const productUnits = Product.schema.path("unit").enumValues;
  let products = [];

  function chooseRandomUnit() {
    const randomIndex = Math.floor(Math.random() * productUnits.length);
    const randomProductUnit = productUnits[randomIndex];
    return randomProductUnit;
  }

  function chooseRandomInt(min, max) {
    const randomDecimal = Math.random();
    // Scale the random decimal to the range between min and max
    const randomInRange = randomDecimal * (max - min) + min;
    // Round the result to avoid floating-point precision issues
    const randomPrice = Math.round(randomInRange / 100) * 100;

    return randomPrice;
  }

  for (let i = 0; i < n; i++) {
    const title = faker.commerce.product();
    const slug = title + faker.string.uuid();
    const product = new Product({
      title,
      slug,
      description: faker.commerce.productDescription(),
      unit: chooseRandomUnit(),
      unitPrice: chooseRandomInt(1000, 1000000),
      availableStock: chooseRandomInt(10, 100),
      media: [faker.airline.aircraftType()],
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
